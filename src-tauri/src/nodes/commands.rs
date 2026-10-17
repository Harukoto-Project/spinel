use tauri::State;

use super::model::StoredNode;
use super::store::NodeStore;

#[tauri::command]
pub fn load_nodes(store: State<'_, NodeStore>) -> Result<Vec<StoredNode>, String> {
    store.load()
}

#[tauri::command]
pub fn save_nodes(store: State<'_, NodeStore>, nodes: Vec<StoredNode>) -> Result<(), String> {
    store.save(&nodes)
}
