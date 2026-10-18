use tauri::State;

use super::api;
use super::model::{ApiKeyId, ApiKeyStatusMap};
use crate::mail_accounts::commands::resolve_node;
use crate::nodes::store::NodeStore;
use crate::notifications::api::ApiError;

#[tauri::command]
pub async fn load_api_keys(
    nodes: State<'_, NodeStore>,
    node_id: String,
) -> Result<ApiKeyStatusMap, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::load_keys(&target)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn save_api_key(
    nodes: State<'_, NodeStore>,
    node_id: String,
    key_id: ApiKeyId,
    value: String,
) -> Result<ApiKeyStatusMap, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::save_key(&target, key_id, &value)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn delete_api_key(
    nodes: State<'_, NodeStore>,
    node_id: String,
    key_id: ApiKeyId,
) -> Result<ApiKeyStatusMap, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::delete_key(&target, key_id)
        .await
        .map_err(ApiError::into_message)
}
