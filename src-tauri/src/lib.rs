mod nodes;

use tauri::Manager;

use nodes::commands::{load_nodes, save_nodes};
use nodes::store::NodeStore;

const NODES_FILE: &str = "nodes.json";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let dir = app.path().app_data_dir()?;
            app.manage(NodeStore::new(dir.join(NODES_FILE)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![load_nodes, save_nodes])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
