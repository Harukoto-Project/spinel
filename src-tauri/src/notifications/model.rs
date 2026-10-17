use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum PriorityFilter {
    #[default]
    All,
    UrgentOnly,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct NotificationSettings {
    pub enabled: bool,
    pub priority_filter: PriorityFilter,
    pub show_content: bool,
}

impl Default for NotificationSettings {
    fn default() -> Self {
        Self {
            enabled: true,
            priority_filter: PriorityFilter::All,
            show_content: true,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NotificationConfigView {
    pub settings: NotificationSettings,
    pub admin_key_set: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum ConnectionState {
    Disabled,
    NeedsKey,
    Connecting,
    Connected,
    Disconnected,
    Unauthorized,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionStatus {
    pub node_id: String,
    pub state: ConnectionState,
    pub message: Option<String>,
    pub updated_at: u64,
}

pub fn admin_key_secret(node_id: &str) -> String {
    format!("node-admin-key:{}", node_id)
}
