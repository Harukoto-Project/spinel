use std::time::Duration;

use reqwest::{Method, StatusCode};
use serde::de::DeserializeOwned;
use serde_json::{Value, json};

use super::model::{AccountsResponse, MailAccountView, MailSettings, OAuthStartResponse};
use super::provider::MailProvider;
use crate::notifications::api::ApiError;

const REQUEST_TIMEOUT: Duration = Duration::from_secs(40);

pub struct NodeTarget {
    pub address: String,
    pub admin_key: String,
}

fn endpoint(address: &str, path: &str) -> String {
    format!("{}{}", address.trim_end_matches('/'), path)
}

fn server_message(body: &str) -> Option<String> {
    let value: Value = serde_json::from_str(body).ok()?;
    value
        .get("error")?
        .get("message")?
        .as_str()
        .map(str::to_string)
}

pub(crate) async fn send<T: DeserializeOwned>(
    target: &NodeTarget,
    method: Method,
    path: &str,
    body: Option<Value>,
) -> Result<T, ApiError> {
    send_with_timeout(target, method, path, body, REQUEST_TIMEOUT).await
}

pub(crate) async fn send_with_timeout<T: DeserializeOwned>(
    target: &NodeTarget,
    method: Method,
    path: &str,
    body: Option<Value>,
    timeout: Duration,
) -> Result<T, ApiError> {
    request(target, method, path, body, timeout)
        .await?
        .json::<T>()
        .await
        .map_err(|e| ApiError::Other(format!("ノードの応答の形式が正しくありません: {e}")))
}

pub(crate) async fn request(
    target: &NodeTarget,
    method: Method,
    path: &str,
    body: Option<Value>,
    timeout: Duration,
) -> Result<reqwest::Response, ApiError> {
    let client = reqwest::Client::builder()
        .timeout(timeout)
        .build()
        .map_err(|e| ApiError::Other(e.to_string()))?;

    let mut request = client
        .request(method, endpoint(&target.address, path))
        .bearer_auth(&target.admin_key);
    if let Some(body) = body {
        request = request.json(&body);
    }

    let response = request
        .send()
        .await
        .map_err(|e| ApiError::Other(format!("ノードに接続できません: {e}")))?;

    let status = response.status();
    if status.is_success() {
        return Ok(response);
    }

    match status {
        StatusCode::UNAUTHORIZED | StatusCode::FORBIDDEN => Err(ApiError::Unauthorized),
        StatusCode::TOO_MANY_REQUESTS => Err(ApiError::RateLimited),
        other => {
            let text = response.text().await.unwrap_or_default();
            let message = server_message(&text).unwrap_or_else(|| {
                if other == StatusCode::NOT_FOUND {
                    "ノードがこの機能に対応していません。サーバーを更新してください".to_string()
                } else {
                    format!("ノードがエラーを返しました({other})")
                }
            });
            Err(ApiError::Other(message))
        }
    }
}

pub async fn list_accounts(target: &NodeTarget) -> Result<Vec<MailAccountView>, ApiError> {
    let response: AccountsResponse = send(target, Method::GET, "/mail/accounts", None).await?;
    Ok(response.accounts)
}

pub async fn start_oauth(
    target: &NodeTarget,
    provider: MailProvider,
    redirect_uri: &str,
    state: &str,
    code_challenge: &str,
) -> Result<String, ApiError> {
    let body = json!({
        "provider": provider,
        "redirectUri": redirect_uri,
        "state": state,
        "codeChallenge": code_challenge,
    });
    let response: OAuthStartResponse =
        send(target, Method::POST, "/mail/oauth/start", Some(body)).await?;
    Ok(response.auth_url)
}

pub async fn complete_oauth(
    target: &NodeTarget,
    provider: MailProvider,
    code: &str,
    code_verifier: &str,
    redirect_uri: &str,
) -> Result<Vec<MailAccountView>, ApiError> {
    let body = json!({
        "provider": provider,
        "code": code,
        "codeVerifier": code_verifier,
        "redirectUri": redirect_uri,
    });
    let response: AccountsResponse =
        send(target, Method::POST, "/mail/oauth/complete", Some(body)).await?;
    Ok(response.accounts)
}

pub async fn delete_account(
    target: &NodeTarget,
    account_id: &str,
) -> Result<Vec<MailAccountView>, ApiError> {
    let path = format!("/mail/accounts/{}", urlencoding_path(account_id));
    let response: AccountsResponse = send(target, Method::DELETE, &path, None).await?;
    Ok(response.accounts)
}

pub async fn load_settings(target: &NodeTarget) -> Result<MailSettings, ApiError> {
    send(target, Method::GET, "/mail/settings", None).await
}

pub async fn save_settings(
    target: &NodeTarget,
    settings: &MailSettings,
) -> Result<MailSettings, ApiError> {
    send(
        target,
        Method::PUT,
        "/mail/settings",
        Some(json!({ "pollIntervalSec": settings.poll_interval_sec })),
    )
    .await
}

fn urlencoding_path(segment: &str) -> String {
    url::form_urlencoded::byte_serialize(segment.as_bytes()).collect()
}
