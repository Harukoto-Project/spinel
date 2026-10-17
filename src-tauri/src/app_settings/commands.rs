use tauri::{AppHandle, State};

use super::autostart;
use super::model::AppSettings;
use super::store::AppSettingsStore;

#[tauri::command]
pub fn load_app_settings(store: State<'_, AppSettingsStore>) -> Result<AppSettings, String> {
    store.load()
}

#[tauri::command]
pub fn save_app_settings(
    app: AppHandle,
    store: State<'_, AppSettingsStore>,
    settings: AppSettings,
) -> Result<AppSettings, String> {
    autostart::apply(&app, settings.launch_at_login)?;
    store.save(&settings)?;
    Ok(settings)
}
