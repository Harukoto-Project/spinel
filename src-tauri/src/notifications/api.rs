use std::time::Duration;

use reqwest::StatusCode;
use serde::de::DeserializeOwned;
use serde_json::{Value, json};

use super::protocol::{Priority, TestResponse, TokenResponse};

const REQUEST_TIMEOUT: Duration = Duration::from_secs(10);

pub enum ApiError {
    Unauthorized,
    RateLimited,
    Other(String),
}

impl ApiError {
    pub fn into_message(self) -> String {
        match self {
            ApiError::Unauthorized => "管理キーが受け付けられませんでした".to_string(),
            ApiError::RateLimited => {
                "認証の失敗が続いたため、しばらく待ってから再試行してください".to_string()
            }
            ApiError::Other(message) => message,
        }
    }
}

fn endpoint(address: &str, path: &str) -> String {
    format!("{}{}", address.trim_end_matches('/'), path)
}

async fn post<T: DeserializeOwned>(
    address: &str,
    path: &str,
    admin_key: &str,
    body: Option<Value>,
) -> Result<T, ApiError> {
    let client = reqwest::Client::builder()
        .timeout(REQUEST_TIMEOUT)
        .build()
        .map_err(|e| ApiError::Other(e.to_string()))?;

    let mut request = client
        .post(endpoint(address, path))
        .bearer_auth(admin_key);
    if let Some(body) = body {
        request = request.json(&body);
    }

    let response = request
        .send()
        .await
        .map_err(|e| ApiError::Other(format!("ノードに接続できません: {e}")))?;

    let status = response.status();
    if status.is_success() {
        return response
            .json::<T>()
            .await
            .map_err(|e| ApiError::Other(format!("ノードの応答の形式が正しくありません: {e}")));
    }

    match status {
        StatusCode::UNAUTHORIZED | StatusCode::FORBIDDEN => Err(ApiError::Unauthorized),
        StatusCode::TOO_MANY_REQUESTS => Err(ApiError::RateLimited),
        other => Err(ApiError::Other(format!(
            "ノードがエラーを返しました({other})"
        ))),
    }
}

pub async fn fetch_token(address: &str, admin_key: &str) -> Result<TokenResponse, ApiError> {
    post(address, "/notifications/token", admin_key, None).await
}

pub async fn send_test(
    address: &str,
    admin_key: &str,
    priority: Priority,
) -> Result<u32, ApiError> {
    let response: TestResponse = post(
        address,
        "/notifications/test",
        admin_key,
        Some(json!({ "priority": priority })),
    )
    .await?;
    Ok(response.delivered)
}

pub fn socket_url(address: &str, socket_path: &str) -> Result<String, String> {
    if !socket_path.starts_with('/') || socket_path.starts_with("//") {
        return Err(format!("ソケットのパスが正しくありません: {socket_path}"));
    }

    let base = address.trim_end_matches('/');
    let origin = if let Some(rest) = base.strip_prefix("https://") {
        format!("wss://{rest}")
    } else if let Some(rest) = base.strip_prefix("http://") {
        format!("ws://{rest}")
    } else {
        return Err(format!("対応していないアドレスです: {address}"));
    };

    Ok(format!("{origin}{socket_path}"))
}
