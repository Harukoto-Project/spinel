use tauri::{AppHandle, Emitter, Manager};

use super::clock::now_ms;
use super::history_store::NotificationHistoryStore;
use super::model::{PriorityFilter, ReceivedNotification};
use super::protocol::{Kind, NotificationPayload, Priority};
use super::settings_store::NotificationSettingsStore;
use super::toast;
use crate::nodes::model::StoredNode;

pub const RECEIVED_EVENT: &str = "notification-received";

pub fn deliver(
    app: &AppHandle,
    node: &StoredNode,
    id: String,
    sent_at: String,
    payload: NotificationPayload,
) {
    let settings = app
        .state::<NotificationSettingsStore>()
        .load(&node.id)
        .unwrap_or_default();

    let allowed = match settings.priority_filter {
        PriorityFilter::All => true,
        PriorityFilter::UrgentOnly => {
            payload.priority == Priority::Urgent || payload.kind == Kind::Test
        }
    };

    let shown = allowed
        && match toast::show(app, &node.name, &payload, &settings) {
            Ok(()) => true,
            Err(e) => {
                eprintln!("Windows 通知を表示できません: {e}");
                false
            }
        };

    let record = ReceivedNotification {
        id,
        node_id: node.id.clone(),
        sent_at,
        received_at: now_ms(),
        shown,
        payload,
    };

    if let Err(e) = app
        .state::<NotificationHistoryStore>()
        .push(record.clone())
    {
        eprintln!("通知履歴を保存できません: {e}");
    }
    let _ = app.emit(RECEIVED_EVENT, &record);
}
