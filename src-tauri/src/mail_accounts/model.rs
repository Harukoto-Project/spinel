use serde::{Deserialize, Serialize};

use super::provider::MailProvider;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MailAccountView {
    pub id: String,
    pub provider: MailProvider,
    pub email: String,
    pub name: String,
    pub connected_at: u64,
    pub connected: bool,
    pub last_error: Option<String>,
    pub last_checked_at: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MailSettings {
    pub poll_interval_sec: u32,
}

#[derive(Debug, Deserialize)]
pub struct AccountsResponse {
    pub accounts: Vec<MailAccountView>,
}
