use tauri::State;

use super::api;
use super::model::MailHistoryEntry;
use crate::mail_accounts::commands::resolve_node;
use crate::nodes::store::NodeStore;
use crate::notifications::api::ApiError;

#[tauri::command]
pub async fn load_mail_history(
    nodes: State<'_, NodeStore>,
    node_id: String,
) -> Result<Vec<MailHistoryEntry>, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::list_history(&target)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn delete_mail_history(
    nodes: State<'_, NodeStore>,
    node_id: String,
    entry_id: String,
) -> Result<Vec<MailHistoryEntry>, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::delete_history(&target, &entry_id)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn clear_mail_history(
    nodes: State<'_, NodeStore>,
    node_id: String,
) -> Result<Vec<MailHistoryEntry>, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::clear_history(&target)
        .await
        .map_err(ApiError::into_message)
}
