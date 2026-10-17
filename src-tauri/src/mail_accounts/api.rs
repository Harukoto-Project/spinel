use std::time::Duration;

use reqwest::{Method, StatusCode};
use serde::de::DeserializeOwned;
use serde_json::{Value, json};

use super::model::{AccountsResponse, MailAccountView, MailSettings};
use super::oauth::config::OAuthGrant;
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

async fn send<T: DeserializeOwned>(
    target: &NodeTarget,
    method: Method,
    path: &str,
    body: Option<Value>,
) -> Result<T, ApiError> {
    let client = reqwest::Client::builder()
        .timeout(REQUEST_TIMEOUT)
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
        return response
            .json::<T>()
            .await
            .map_err(|e| ApiError::Other(format!("ノードの応答の形式が正しくありません: {e}")));
    }

    match status {
        StatusCode::UNAUTHORIZED | StatusCode::FORBIDDEN => Err(ApiError::Unauthorized),
        StatusCode::TOO_MANY_REQUESTS => Err(ApiError::RateLimited),
        other => {
            let text = response.text().await.unwrap_or_default();
            let message = server_message(&text).unwrap_or_else(|| {
                if other == StatusCode::NOT_FOUND {
                    "ノードがメール機能に対応していません。サーバーを更新してください".to_string()
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

pub async fn connect_account(
    target: &NodeTarget,
    provider: MailProvider,
    grant: OAuthGrant,
) -> Result<Vec<MailAccountView>, ApiError> {
    let body = json!({
        "provider": provider,
        "email": grant.identity.email,
        "name": grant.identity.name,
        "refreshToken": grant.refresh_token,
    });
    let response: AccountsResponse =
        send(target, Method::POST, "/mail/accounts", Some(body)).await?;
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
