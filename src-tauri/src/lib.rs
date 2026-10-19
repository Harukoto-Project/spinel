mod api_keys;
mod app_settings;
mod json_file;
mod mail_accounts;
mod mail_history;
mod nodes;
mod notifications;
mod plugins;
mod secrets;
mod ssh_key;
mod tray;

use tauri::Manager;

use api_keys::commands::{delete_api_key, load_api_keys, save_api_key};
use app_settings::commands::{load_app_settings, save_app_settings};
use app_settings::store::AppSettingsStore;
use mail_accounts::commands::{
    connect_mail_account, delete_mail_account, load_mail_accounts, load_mail_settings,
    save_mail_settings,
};
use mail_history::commands::{clear_mail_history, delete_mail_history, load_mail_history};
use nodes::commands::{load_nodes, save_nodes};
use nodes::store::NodeStore;
use notifications::commands::{
    delete_node_admin_key, delete_notification_config, get_notification_connections,
    load_notification_config, refresh_notification_connections, save_notification_settings,
    send_test_notification, set_node_admin_key,
};
use notifications::manager::NotificationManager;
use notifications::settings_store::NotificationSettingsStore;
use plugins::app_commands::{
    load_plugin_app, query_plugin_app_command, read_plugin_app_command_logs,
    read_plugin_app_setup_logs, run_plugin_app_command, run_plugin_app_setup,
    stop_plugin_app_command, update_plugin_app_source,
};
use plugins::commands::{
    add_plugin_repository, delete_plugin_repository, disable_plugin, enable_plugin,
    fetch_plugin_asset, load_plugin_repositories, load_plugins, refresh_plugin_repository,
    request_plugin_api, save_plugin_settings,
};
use ssh_key::commands::{load_ssh_key, regenerate_ssh_key};

const NODES_FILE: &str = "nodes.json";
const LEGACY_MAIL_ACCOUNTS_FILE: &str = "mail_accounts.json";
const LEGACY_IMAP_FILE: &str = "imap.json";
const LEGACY_NOTIFICATION_HISTORY_FILE: &str = "notification_history.json";
const NOTIFICATION_SETTINGS_FILE: &str = "notification_settings.json";
const APP_SETTINGS_FILE: &str = "app_settings.json";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .on_window_event(tray::handle_window_event)
        .setup(|app| {
            let dir = app.path().app_data_dir()?;
            app.manage(NodeStore::new(dir.join(NODES_FILE)));
            app.manage(NotificationSettingsStore::new(
                dir.join(NOTIFICATION_SETTINGS_FILE),
            ));
            app.manage(NotificationManager::new());
            app.manage(AppSettingsStore::new(dir.join(APP_SETTINGS_FILE)));

            tray::setup(app.handle())?;

            let settings = app
                .state::<AppSettingsStore>()
                .load()
                .unwrap_or_else(|e| {
                    eprintln!("アプリ設定を読み込めません(既定値を使用します): {e}");
                    Default::default()
                });
            if !settings.start_minimized {
                tray::show_main_window(app.handle());
            }
            if !cfg!(debug_assertions) {
                if let Err(e) = app_settings::autostart::apply(app.handle(), settings.launch_at_login)
                {
                    eprintln!("{e}");
                }
            }

            if let Err(e) = mail_accounts::legacy::purge_imap_data(&dir.join(LEGACY_IMAP_FILE)) {
                eprintln!("旧IMAP設定を削除できません: {e}");
            }
            if let Err(e) = mail_accounts::legacy::purge_local_mail_accounts(
                &dir.join(LEGACY_MAIL_ACCOUNTS_FILE),
            ) {
                eprintln!("旧メールアカウント設定を削除できません: {e}");
            }
            if let Err(e) = mail_accounts::legacy::purge_local_notification_history(
                &dir.join(LEGACY_NOTIFICATION_HISTORY_FILE),
            ) {
                eprintln!("旧通知履歴を削除できません: {e}");
            }

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
            load_app_settings,
            save_app_settings,
            load_mail_accounts,
            connect_mail_account,
            delete_mail_account,
            load_mail_settings,
            save_mail_settings,
            load_mail_history,
            delete_mail_history,
            clear_mail_history,
            load_api_keys,
            save_api_key,
            delete_api_key,
            load_notification_config,
            save_notification_settings,
            set_node_admin_key,
            delete_node_admin_key,
            delete_notification_config,
            refresh_notification_connections,
            get_notification_connections,
            send_test_notification,
            load_plugin_repositories,
            add_plugin_repository,
            refresh_plugin_repository,
            delete_plugin_repository,
            load_plugins,
            enable_plugin,
            disable_plugin,
            save_plugin_settings,
            fetch_plugin_asset,
            request_plugin_api,
            load_plugin_app,
            update_plugin_app_source,
            run_plugin_app_setup,
            read_plugin_app_setup_logs,
            run_plugin_app_command,
            stop_plugin_app_command,
            read_plugin_app_command_logs,
            query_plugin_app_command,
            load_ssh_key,
            regenerate_ssh_key
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
