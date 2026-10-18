use reqwest::Method;
use serde_json::json;

use super::model::{ApiKeyId, ApiKeyStatusMap, KeysResponse};
use crate::mail_accounts::api::{NodeTarget, send};
use crate::notifications::api::ApiError;

fn key_path(id: ApiKeyId) -> String {
    format!("/api-keys/{}", id.as_str())
}

pub async fn load_keys(target: &NodeTarget) -> Result<ApiKeyStatusMap, ApiError> {
    let response: KeysResponse = send(target, Method::GET, "/api-keys", None).await?;
    Ok(response.keys)
}

pub async fn save_key(
    target: &NodeTarget,
    id: ApiKeyId,
    value: &str,
) -> Result<ApiKeyStatusMap, ApiError> {
    let response: KeysResponse = send(
        target,
        Method::PUT,
        &key_path(id),
        Some(json!({ "value": value })),
    )
    .await?;
    Ok(response.keys)
}

pub async fn delete_key(target: &NodeTarget, id: ApiKeyId) -> Result<ApiKeyStatusMap, ApiError> {
    let response: KeysResponse = send(target, Method::DELETE, &key_path(id), None).await?;
    Ok(response.keys)
}
