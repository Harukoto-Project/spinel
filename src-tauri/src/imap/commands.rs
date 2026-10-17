use tauri::State;

use super::model::{ImapAccountInput, ImapConfigView, ImapSettings};
use super::store::ImapStore;

#[tauri::command]
pub fn load_imap_config(
    store: State<'_, ImapStore>,
    node_id: String,
) -> Result<ImapConfigView, String> {
    store.load(&node_id)
}

#[tauri::command]
pub fn save_imap_account(
    store: State<'_, ImapStore>,
    node_id: String,
    account: ImapAccountInput,
) -> Result<ImapConfigView, String> {
    store.save_account(&node_id, account)
}

#[tauri::command]
pub fn delete_imap_account(
    store: State<'_, ImapStore>,
    node_id: String,
    account_id: String,
) -> Result<ImapConfigView, String> {
    store.delete_account(&node_id, &account_id)
}

#[tauri::command]
pub fn save_imap_settings(
    store: State<'_, ImapStore>,
    node_id: String,
    settings: ImapSettings,
) -> Result<ImapConfigView, String> {
    store.save_settings(&node_id, settings)
}

#[tauri::command]
pub fn delete_imap_config(store: State<'_, ImapStore>, node_id: String) -> Result<(), String> {
    store.delete_node(&node_id)
}
