use tauri::{AppHandle, State};

use super::api::{self, NodeTarget};
use super::model::{MailAccountView, MailSettings};
use super::oauth::flow;
use super::provider::MailProvider;
use crate::nodes::store::NodeStore;
use crate::notifications::api::ApiError;
use crate::notifications::model::admin_key_secret;
use crate::secrets;

fn resolve_node(nodes: &NodeStore, node_id: &str) -> Result<NodeTarget, String> {
    let node = nodes
        .load()?
        .into_iter()
        .find(|node| node.id == node_id)
        .ok_or("ノードが見つかりません")?;
    let admin_key = secrets::get(&admin_key_secret(&node.id))?.ok_or(
        "このノードの管理キーが設定されていません。「メールの通知設定」ページで管理キーを保存してください",
    )?;
    Ok(NodeTarget {
        address: node.address,
        admin_key,
    })
}

#[tauri::command]
pub async fn load_mail_accounts(
    nodes: State<'_, NodeStore>,
    node_id: String,
) -> Result<Vec<MailAccountView>, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::list_accounts(&target)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn connect_mail_account(
    app: AppHandle,
    nodes: State<'_, NodeStore>,
    node_id: String,
    provider: MailProvider,
) -> Result<Vec<MailAccountView>, String> {
    let target = resolve_node(&nodes, &node_id)?;
    let config = provider.oauth_config()?;
    let grant = flow::authorize(&app, &config).await?;
    api::connect_account(&target, provider, grant)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn delete_mail_account(
    nodes: State<'_, NodeStore>,
    node_id: String,
    account_id: String,
) -> Result<Vec<MailAccountView>, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::delete_account(&target, &account_id)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn load_mail_settings(
    nodes: State<'_, NodeStore>,
    node_id: String,
) -> Result<MailSettings, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::load_settings(&target)
        .await
        .map_err(ApiError::into_message)
}

#[tauri::command]
pub async fn save_mail_settings(
    nodes: State<'_, NodeStore>,
    node_id: String,
    settings: MailSettings,
) -> Result<MailSettings, String> {
    let target = resolve_node(&nodes, &node_id)?;
    api::save_settings(&target, &settings)
        .await
        .map_err(ApiError::into_message)
}
