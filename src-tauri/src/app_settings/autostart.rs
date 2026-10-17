use tauri::AppHandle;
use tauri_plugin_autostart::ManagerExt;

pub fn apply(app: &AppHandle, enabled: bool) -> Result<(), String> {
    let manager = app.autolaunch();
    let current = manager
        .is_enabled()
        .map_err(|e| format!("自動起動の状態を取得できません: {e}"))?;

    if current == enabled {
        return Ok(());
    }

    let result = if enabled {
        manager.enable()
    } else {
        manager.disable()
    };
    result.map_err(|e| format!("自動起動の設定を変更できません: {e}"))
}
