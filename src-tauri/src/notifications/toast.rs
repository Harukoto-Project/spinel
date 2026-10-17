use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt;

use super::model::NotificationSettings;
use super::protocol::{Kind, NotificationPayload, Priority};

const URGENT_PREFIX: &str = "【緊急】";
const HIDDEN_TITLE: &str = "新着メール";

pub fn show(
    app: &AppHandle,
    node_name: &str,
    payload: &NotificationPayload,
    settings: &NotificationSettings,
) -> Result<(), String> {
    let reveal = settings.show_content || payload.kind == Kind::Test;
    let (title, body) = if reveal {
        (payload.title.clone(), payload.body.clone())
    } else {
        (
            HIDDEN_TITLE.to_string(),
            format!("{node_name} に重要なメールが届きました"),
        )
    };

    let title = if payload.priority == Priority::Urgent {
        format!("{URGENT_PREFIX}{title}")
    } else {
        title
    };

    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| e.to_string())
}
