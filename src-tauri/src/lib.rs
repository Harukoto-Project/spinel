mod imap;
mod json_file;
mod nodes;
mod secrets;

use tauri::Manager;

use imap::commands::{
    delete_imap_account, delete_imap_config, load_imap_config, save_imap_account,
    save_imap_settings,
};
use imap::store::ImapStore;
use nodes::commands::{load_nodes, save_nodes};
use nodes::store::NodeStore;

const NODES_FILE: &str = "nodes.json";
const IMAP_FILE: &str = "imap.json";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let dir = app.path().app_data_dir()?;
            app.manage(NodeStore::new(dir.join(NODES_FILE)));
            app.manage(ImapStore::new(dir.join(IMAP_FILE)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_nodes,
            save_nodes,
            load_imap_config,
            save_imap_account,
            delete_imap_account,
            save_imap_settings,
            delete_imap_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
