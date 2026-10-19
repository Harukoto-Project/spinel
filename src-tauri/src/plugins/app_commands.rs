use serde_json::Value;
use tauri::State;

use super::app_api;
use crate::mail_accounts::commands::resolve_node;
use crate::nodes::store::NodeStore;
use crate::notifications::api::ApiError;

#[tauri::command]
pub async fn load_plugin_app(
    nodes: State<'_, NodeStore>,
    node_id: String,
    plugin_id: String,
) -> Result<Value, String> {
    let target = resolve_node(&nodes, &node_id)?;
    app_api::load_overview(&target, &plugin_id)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn update_plugin_app_source(
    nodes: State<'_, NodeStore>,
    node_id: String,
    plugin_id: String,
) -> Result<Value, String> {
    let target = resolve_node(&nodes, &node_id)?;
    app_api::update_source(&target, &plugin_id)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn run_plugin_app_setup(
    nodes: State<'_, NodeStore>,
    node_id: String,
    plugin_id: String,
) -> Result<Value, String> {
    let target = resolve_node(&nodes, &node_id)?;
    app_api::run_setup(&target, &plugin_id)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn read_plugin_app_setup_logs(
    nodes: State<'_, NodeStore>,
    node_id: String,
    plugin_id: String,
    step_id: String,
    after: u64,
) -> Result<Value, String> {
    let target = resolve_node(&nodes, &node_id)?;
    app_api::read_setup_logs(&target, &plugin_id, &step_id, after)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn run_plugin_app_command(
    nodes: State<'_, NodeStore>,
    node_id: String,
    plugin_id: String,
    command_id: String,
    inputs: Option<Value>,
) -> Result<Value, String> {
    let target = resolve_node(&nodes, &node_id)?;
    app_api::run_command(&target, &plugin_id, &command_id, inputs)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn stop_plugin_app_command(
    nodes: State<'_, NodeStore>,
    node_id: String,
    plugin_id: String,
    command_id: String,
) -> Result<Value, String> {
    let target = resolve_node(&nodes, &node_id)?;
    app_api::stop_command(&target, &plugin_id, &command_id)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn read_plugin_app_command_logs(
    nodes: State<'_, NodeStore>,
    node_id: String,
    plugin_id: String,
    command_id: String,
    after: u64,
) -> Result<Value, String> {
    let target = resolve_node(&nodes, &node_id)?;
    app_api::read_command_logs(&target, &plugin_id, &command_id, after)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn query_plugin_app_command(
    nodes: State<'_, NodeStore>,
    node_id: String,
    plugin_id: String,
    command_id: String,
    inputs: Option<Value>,
) -> Result<Value, String> {
    let target = resolve_node(&nodes, &node_id)?;
    app_api::query_command(&target, &plugin_id, &command_id, inputs)
        .await
        .map_err(ApiError::into_message)
}
