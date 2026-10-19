use tauri::State;

use super::api;
use super::model::SshKeyView;
use crate::mail_accounts::commands::resolve_node;
use crate::nodes::store::NodeStore;
use crate::notifications::api::ApiError;

#[tauri::command]
pub async fn load_ssh_key(
    nodes: State<'_, NodeStore>,
    node_id: String,
) -> Result<SshKeyView, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::load_key(&target)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn regenerate_ssh_key(
    nodes: State<'_, NodeStore>,
    node_id: String,
) -> Result<SshKeyView, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::regenerate_key(&target)
        .await
        .map_err(ApiError::into_message)
}
