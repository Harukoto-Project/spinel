use std::sync::Arc;
use std::time::Duration;

use futures_util::StreamExt;
use tauri::AppHandle;
use tokio::time::{sleep, timeout};
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::http::Uri;
use tokio_tungstenite::tungstenite::{ClientRequestBuilder, Message};

use super::api::{self, ApiError};
use super::delivery;
use super::model::{ConnectionState, admin_key_secret};
use super::protocol::{Envelope, HelloData, NotificationPayload, SUPPORTED_VERSION};
use super::status::StatusBoard;
use crate::nodes::model::StoredNode;
use crate::secrets;

const CONNECT_TIMEOUT: Duration = Duration::from_secs(10);
const DEFAULT_READ_TIMEOUT: Duration = Duration::from_secs(90);
const HEARTBEAT_TIMEOUT_FACTOR: u64 = 3;
const MAX_BACKOFF_SEC: u64 = 30;
const MAX_BACKOFF_STEP: u32 = 5;

enum SessionEnd {
    NeedsKey,
    Unauthorized,
    Failed { message: String, connected: bool },
}

fn failed(message: impl Into<String>) -> SessionEnd {
    SessionEnd::Failed {
        message: message.into(),
        connected: false,
    }
}

fn lost(message: impl Into<String>) -> SessionEnd {
    SessionEnd::Failed {
        message: message.into(),
        connected: true,
    }
}

fn backoff(attempt: u32) -> Duration {
    Duration::from_secs((1u64 << attempt.min(MAX_BACKOFF_STEP)).min(MAX_BACKOFF_SEC))
}

pub async fn run(app: AppHandle, board: Arc<StatusBoard>, node: StoredNode) {
    let mut attempt: u32 = 0;

    loop {
        board.set(&app, &node.id, ConnectionState::Connecting, None);

        match session(&app, &board, &node).await {
            SessionEnd::NeedsKey => {
                board.set(&app, &node.id, ConnectionState::NeedsKey, None);
                std::future::pending::<()>().await;
            }
            SessionEnd::Unauthorized => {
                board.set(
                    &app,
                    &node.id,
                    ConnectionState::Unauthorized,
                    Some("管理キーが受け付けられませんでした".to_string()),
                );
                std::future::pending::<()>().await;
            }
            SessionEnd::Failed { message, connected } => {
                attempt = if connected { 0 } else { attempt.saturating_add(1) };
                board.set(&app, &node.id, ConnectionState::Disconnected, Some(message));
                sleep(backoff(attempt)).await;
            }
        }
    }
}

async fn session(app: &AppHandle, board: &StatusBoard, node: &StoredNode) -> SessionEnd {
    let key = match secrets::get(&admin_key_secret(&node.id)) {
        Ok(Some(key)) => key,
        Ok(None) => return SessionEnd::NeedsKey,
        Err(message) => return failed(message),
    };

    let token = match api::fetch_token(&node.address, &key).await {
        Ok(token) => token,
        Err(ApiError::Unauthorized) => return SessionEnd::Unauthorized,
        Err(other) => return failed(other.into_message()),
    };

    let url = match api::socket_url(&node.address, &token.socket_path) {
        Ok(url) => url,
        Err(message) => return failed(message),
    };
    let uri: Uri = match url.parse() {
        Ok(uri) => uri,
        Err(e) => return failed(format!("接続先のアドレスが正しくありません: {e}")),
    };

    let request = ClientRequestBuilder::new(uri)
        .with_header("Authorization", format!("Bearer {}", token.token));
    let mut stream = match timeout(CONNECT_TIMEOUT, connect_async(request)).await {
        Err(_) => return failed("接続がタイムアウトしました"),
        Ok(Err(e)) => return failed(format!("WebSocket に接続できません: {e}")),
        Ok(Ok((stream, _response))) => stream,
    };

    board.set(app, &node.id, ConnectionState::Connected, None);

    let mut read_timeout = DEFAULT_READ_TIMEOUT;
    loop {
        let next = match timeout(read_timeout, stream.next()).await {
            Ok(next) => next,
            Err(_) => return lost("サーバーからの応答がありません"),
        };

        match next {
            None => return lost("接続が閉じられました"),
            Some(Err(e)) => return lost(format!("接続エラー: {e}")),
            Some(Ok(Message::Close(_))) => return lost("サーバーが接続を閉じました"),
            Some(Ok(Message::Text(text))) => {
                if let Some(updated) = handle_text(app, node, &text) {
                    read_timeout = updated;
                }
            }
            Some(Ok(_)) => {}
        }
    }
}

fn handle_text(app: &AppHandle, node: &StoredNode, text: &str) -> Option<Duration> {
    let envelope: Envelope = match serde_json::from_str(text) {
        Ok(envelope) => envelope,
        Err(e) => {
            eprintln!("受信したメッセージを解釈できません: {e}");
            return None;
        }
    };

    if envelope.v != SUPPORTED_VERSION {
        eprintln!("未対応のプロトコルバージョンです: {}", envelope.v);
        return None;
    }

    match envelope.kind.as_str() {
        "hello" => serde_json::from_value::<HelloData>(envelope.data)
            .ok()
            .map(|hello| {
                Duration::from_secs(hello.heartbeat_interval_sec.max(1) * HEARTBEAT_TIMEOUT_FACTOR)
            }),
        "notification" => {
            match serde_json::from_value::<NotificationPayload>(envelope.data) {
                Ok(payload) => delivery::deliver(app, node, envelope.id, envelope.sent_at, payload),
                Err(e) => eprintln!("通知の形式が正しくありません: {e}"),
            }
            None
        }
        _ => None,
    }
}
