use tauri::{AppHandle, State};

use super::model::MailAccountView;
use super::oauth::flow;
use super::provider::MailProvider;
use super::store::MailAccountStore;

#[tauri::command]
pub fn load_mail_accounts(
    store: State<'_, MailAccountStore>,
    node_id: String,
) -> Result<Vec<MailAccountView>, String> {
    store.load(&node_id)
}

#[tauri::command]
pub async fn connect_mail_account(
    app: AppHandle,
    store: State<'_, MailAccountStore>,
    node_id: String,
    provider: MailProvider,
) -> Result<Vec<MailAccountView>, String> {
    let config = provider.oauth_config()?;
    let grant = flow::authorize(&app, &config).await?;
    store.connect(&node_id, provider, grant)
}

#[tauri::command]
pub fn delete_mail_account(
    store: State<'_, MailAccountStore>,
    node_id: String,
    account_id: String,
) -> Result<Vec<MailAccountView>, String> {
    store.delete_account(&node_id, &account_id)
}

#[tauri::command]
pub fn delete_mail_accounts(
    store: State<'_, MailAccountStore>,
    node_id: String,
) -> Result<(), String> {
    store.delete_node(&node_id)
}
