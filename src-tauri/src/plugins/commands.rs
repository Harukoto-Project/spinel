use std::collections::HashMap;

use serde_json::Value;
use tauri::State;

use super::api;
use super::model::{PluginPermissions, PluginRepositoryView, PluginView};
use crate::mail_accounts::commands::resolve_node;
use crate::nodes::store::NodeStore;
use crate::notifications::api::ApiError;

#[tauri::command]
pub async fn load_plugin_repositories(
    nodes: State<'_, NodeStore>,
    node_id: String,
) -> Result<Vec<PluginRepositoryView>, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::load_repositories(&target)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn add_plugin_repository(
    nodes: State<'_, NodeStore>,
    node_id: String,
    url: String,
) -> Result<Vec<PluginRepositoryView>, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::add_repository(&target, &url)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn refresh_plugin_repository(
    nodes: State<'_, NodeStore>,
    node_id: String,
    repo_id: String,
) -> Result<Vec<PluginRepositoryView>, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::refresh_repository(&target, &repo_id)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn delete_plugin_repository(
    nodes: State<'_, NodeStore>,
    node_id: String,
    repo_id: String,
) -> Result<Vec<PluginRepositoryView>, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::delete_repository(&target, &repo_id)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn load_plugins(
    nodes: State<'_, NodeStore>,
    node_id: String,
) -> Result<Vec<PluginView>, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::load_plugins(&target)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn enable_plugin(
    nodes: State<'_, NodeStore>,
    node_id: String,
    plugin_id: String,
    granted_permissions: PluginPermissions,
) -> Result<Vec<PluginView>, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::enable_plugin(&target, &plugin_id, &granted_permissions)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn disable_plugin(
    nodes: State<'_, NodeStore>,
    node_id: String,
    plugin_id: String,
) -> Result<Vec<PluginView>, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::disable_plugin(&target, &plugin_id)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn save_plugin_settings(
    nodes: State<'_, NodeStore>,
    node_id: String,
    plugin_id: String,
    values: HashMap<String, Value>,
) -> Result<Vec<PluginView>, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::save_settings(&target, &plugin_id, &values)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn request_plugin_api(
    nodes: State<'_, NodeStore>,
    node_id: String,
    plugin_id: String,
    method: String,
    path: String,
    body: Option<Value>,
) -> Result<Value, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::call_plugin_route(&target, &plugin_id, &method, &path, body)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn fetch_plugin_asset(
    nodes: State<'_, NodeStore>,
    node_id: String,
    plugin_id: String,
    path: String,
) -> Result<String, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::fetch_front_asset(&target, &plugin_id, &path)
        .await
        .map_err(ApiError::into_message)
}
