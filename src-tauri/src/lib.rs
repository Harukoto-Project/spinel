mod imap;
mod json_file;
mod nodes;
mod notifications;
mod secrets;
mod tray;

use tauri::Manager;

use imap::commands::{
    delete_imap_account, delete_imap_config, load_imap_config, save_imap_account,
    save_imap_settings,
};
use imap::store::ImapStore;
use nodes::commands::{load_nodes, save_nodes};
use nodes::store::NodeStore;
use notifications::commands::{
    clear_notification_history, delete_node_admin_key, delete_notification_config,
    get_notification_connections, load_notification_config, load_notification_history,
    refresh_notification_connections, save_notification_settings, send_test_notification,
    set_node_admin_key,
};
use notifications::history_store::NotificationHistoryStore;
use notifications::manager::NotificationManager;
use notifications::settings_store::NotificationSettingsStore;

const NODES_FILE: &str = "nodes.json";
const IMAP_FILE: &str = "imap.json";
const NOTIFICATION_SETTINGS_FILE: &str = "notification_settings.json";
const NOTIFICATION_HISTORY_FILE: &str = "notification_history.json";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .on_window_event(tray::handle_window_event)
        .setup(|app| {
            let dir = app.path().app_data_dir()?;
            app.manage(NodeStore::new(dir.join(NODES_FILE)));
            app.manage(ImapStore::new(dir.join(IMAP_FILE)));
            app.manage(NotificationSettingsStore::new(
                dir.join(NOTIFICATION_SETTINGS_FILE),
            ));
            app.manage(NotificationHistoryStore::new(
                dir.join(NOTIFICATION_HISTORY_FILE),
            ));
            app.manage(NotificationManager::new());

            tray::setup(app.handle())?;

            if let Err(e) = app
                .state::<NotificationManager>()
                .reconcile(app.handle())
            {
                eprintln!("通知の接続を開始できません: {e}");
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_nodes,
            save_nodes,
            load_imap_config,
            save_imap_account,
            delete_imap_account,
            save_imap_settings,
            delete_imap_config,
            load_notification_config,
            save_notification_settings,
            set_node_admin_key,
            delete_node_admin_key,
            delete_notification_config,
            refresh_notification_connections,
            get_notification_connections,
            load_notification_history,
            clear_notification_history,
            send_test_notification
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
