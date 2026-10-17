use tauri::{AppHandle, State};

use super::api::{self, ApiError};
use super::manager::NotificationManager;
use super::model::{
    ConnectionStatus, NotificationConfigView, NotificationSettings, admin_key_secret,
};
use super::protocol::Priority;
use super::settings_store::NotificationSettingsStore;
use crate::nodes::store::NodeStore;
use crate::secrets;

fn view(store: &NotificationSettingsStore, node_id: &str) -> Result<NotificationConfigView, String> {
    Ok(NotificationConfigView {
        settings: store.load(node_id)?,
        admin_key_set: secrets::exists(&admin_key_secret(node_id))?,
    })
}

#[tauri::command]
pub fn load_notification_config(
    store: State<'_, NotificationSettingsStore>,
    node_id: String,
) -> Result<NotificationConfigView, String> {
    view(&store, &node_id)
}

#[tauri::command]
pub fn save_notification_settings(
    app: AppHandle,
    store: State<'_, NotificationSettingsStore>,
    manager: State<'_, NotificationManager>,
    node_id: String,
    settings: NotificationSettings,
) -> Result<NotificationConfigView, String> {
    store.save(&node_id, settings)?;
    manager.reconcile(&app)?;
    view(&store, &node_id)
}

#[tauri::command]
pub fn set_node_admin_key(
    app: AppHandle,
    store: State<'_, NotificationSettingsStore>,
    manager: State<'_, NotificationManager>,
    node_id: String,
    admin_key: String,
) -> Result<NotificationConfigView, String> {
    let admin_key = admin_key.trim();
    if admin_key.is_empty() {
        return Err("管理キーを入力してください".into());
    }
    secrets::set(&admin_key_secret(&node_id), admin_key)?;
    manager.restart_node(&app, &node_id)?;
    view(&store, &node_id)
}

#[tauri::command]
pub fn delete_node_admin_key(
    app: AppHandle,
    store: State<'_, NotificationSettingsStore>,
    manager: State<'_, NotificationManager>,
    node_id: String,
) -> Result<NotificationConfigView, String> {
    secrets::delete(&admin_key_secret(&node_id))?;
    manager.restart_node(&app, &node_id)?;
    view(&store, &node_id)
}

#[tauri::command]
pub fn delete_notification_config(
    store: State<'_, NotificationSettingsStore>,
    manager: State<'_, NotificationManager>,
    node_id: String,
) -> Result<(), String> {
    manager.stop_node(&node_id)?;
    store.delete(&node_id)?;
    secrets::delete(&admin_key_secret(&node_id))
}

#[tauri::command]
pub fn refresh_notification_connections(
    app: AppHandle,
    manager: State<'_, NotificationManager>,
) -> Result<(), String> {
    manager.reconcile(&app)
}

#[tauri::command]
pub fn get_notification_connections(
    manager: State<'_, NotificationManager>,
) -> Vec<ConnectionStatus> {
    manager.statuses()
}

#[tauri::command]
pub async fn send_test_notification(
    nodes: State<'_, NodeStore>,
    node_id: String,
    priority: Priority,
) -> Result<u32, String> {
    let node = nodes
        .load()?
        .into_iter()
        .find(|node| node.id == node_id)
        .ok_or("ノードが見つかりません")?;
    let admin_key =
        secrets::get(&admin_key_secret(&node.id))?.ok_or("管理キーが設定されていません")?;

    api::send_test(&node.address, &admin_key, priority)
        .await
        .map_err(ApiError::into_message)
}
