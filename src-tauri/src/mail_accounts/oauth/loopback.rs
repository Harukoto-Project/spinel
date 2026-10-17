use std::time::Duration;

use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};

const MAX_REQUEST_BYTES: usize = 8192;
const READ_TIMEOUT: Duration = Duration::from_secs(3);

const SUCCESS_PAGE: &str = "<!doctype html><html lang=\"ja\"><head><meta charset=\"utf-8\"><title>Spinel</title></head><body style=\"font-family:sans-serif;text-align:center;margin-top:20vh\"><h1>認証が完了しました</h1><p>このタブを閉じて Spinel に戻ってください。</p></body></html>";
const NOT_FOUND_PAGE: &str = "<!doctype html><html><head><meta charset=\"utf-8\"></head><body></body></html>";

#[derive(Debug, Default)]
pub struct CallbackParams {
    pub code: Option<String>,
    pub state: Option<String>,
    pub error: Option<String>,
}

pub struct LoopbackServer {
    listener: TcpListener,
    pub redirect_uri: String,
}

impl LoopbackServer {
    pub async fn bind() -> Result<Self, String> {
        let listener = TcpListener::bind(("127.0.0.1", 0))
            .await
            .map_err(|e| format!("認証用のローカルポートを開けません: {e}"))?;
        let port = listener
            .local_addr()
            .map_err(|e| format!("認証用のローカルポートを取得できません: {e}"))?
            .port();
        Ok(Self {
            listener,
            redirect_uri: format!("http://127.0.0.1:{port}"),
        })
    }

    pub async fn wait_for_callback(self, timeout: Duration) -> Result<CallbackParams, String> {
        tokio::time::timeout(timeout, self.accept_callback())
            .await
            .map_err(|_| "認証がタイムアウトしました。もう一度お試しください".to_string())?
    }

    async fn accept_callback(&self) -> Result<CallbackParams, String> {
        loop {
            let (mut stream, _) = self
                .listener
                .accept()
                .await
                .map_err(|e| format!("認証の応答を受け取れません: {e}"))?;

            let Some(target) = read_request_target(&mut stream).await else {
                respond(&mut stream, "400 Bad Request", NOT_FOUND_PAGE).await;
                continue;
            };

            let params = parse_query(&target);
            if params.code.is_none() && params.error.is_none() {
                respond(&mut stream, "404 Not Found", NOT_FOUND_PAGE).await;
                continue;
            }

            respond(&mut stream, "200 OK", SUCCESS_PAGE).await;
            return Ok(params);
        }
    }
}

async fn read_request_target(stream: &mut TcpStream) -> Option<String> {
    let mut buffer = Vec::new();
    let mut chunk = [0u8; 1024];

    while buffer.len() < MAX_REQUEST_BYTES && !buffer.windows(2).any(|pair| pair == b"\r\n") {
        let read = tokio::time::timeout(READ_TIMEOUT, stream.read(&mut chunk))
            .await
            .ok()?
            .ok()?;
        if read == 0 {
            break;
        }
        buffer.extend_from_slice(&chunk[..read]);
    }

    let text = String::from_utf8_lossy(&buffer);
    let mut parts = text.lines().next()?.split_whitespace();
    if parts.next()? != "GET" {
        return None;
    }
    parts.next().map(str::to_string)
}

fn parse_query(target: &str) -> CallbackParams {
    let mut params = CallbackParams::default();
    let Ok(url) = url::Url::parse(&format!("http://127.0.0.1{target}")) else {
        return params;
    };

    for (key, value) in url.query_pairs() {
        match key.as_ref() {
            "code" => params.code = Some(value.into_owned()),
            "state" => params.state = Some(value.into_owned()),
            "error" => params.error = Some(value.into_owned()),
            _ => {}
        }
    }
    params
}

async fn respond(stream: &mut TcpStream, status: &str, body: &str) {
    let response = format!(
        "HTTP/1.1 {status}\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n{body}",
        body.len()
    );
    let _ = stream.write_all(response.as_bytes()).await;
    let _ = stream.shutdown().await;
}
