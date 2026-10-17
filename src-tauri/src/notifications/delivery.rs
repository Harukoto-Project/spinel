use tauri::{AppHandle, Manager};

use super::model::PriorityFilter;
use super::protocol::{Kind, NotificationPayload, Priority};
use super::settings_store::NotificationSettingsStore;
use super::toast;
use crate::nodes::model::StoredNode;

pub fn deliver(app: &AppHandle, node: &StoredNode, payload: NotificationPayload) {
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

    if !allowed {
        return;
    }
    if let Err(e) = toast::show(app, &node.name, &payload, &settings) {
        eprintln!("Windows 通知を表示できません: {e}");
    }
}
