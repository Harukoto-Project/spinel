use reqwest::Method;

use super::model::{HistoryResponse, MailHistoryEntry};
use crate::mail_accounts::api::{NodeTarget, send};
use crate::notifications::api::ApiError;

pub async fn list_history(target: &NodeTarget) -> Result<Vec<MailHistoryEntry>, ApiError> {
    let response: HistoryResponse = send(target, Method::GET, "/mail/history", None).await?;
    Ok(response.history)
}

pub async fn delete_history(
    target: &NodeTarget,
    entry_id: &str,
) -> Result<Vec<MailHistoryEntry>, ApiError> {
    let segment: String = url::form_urlencoded::byte_serialize(entry_id.as_bytes()).collect();
    let path = format!("/mail/history/{segment}");
    let response: HistoryResponse = send(target, Method::DELETE, &path, None).await?;
    Ok(response.history)
}

pub async fn clear_history(target: &NodeTarget) -> Result<Vec<MailHistoryEntry>, ApiError> {
    let response: HistoryResponse = send(target, Method::DELETE, "/mail/history", None).await?;
    Ok(response.history)
}
