use serde::{Deserialize, Serialize};

use crate::mail_accounts::provider::MailProvider;

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MailDecision {
    Notify,
    Ignore,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum HistoryPriority {
    Normal,
    Urgent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MailHistoryEntry {
    pub id: String,
    pub account_id: String,
    pub account_name: String,
    pub account_email: String,
    pub provider: MailProvider,
    pub from: String,
    pub subject: String,
    pub received_at: u64,
    pub processed_at: u64,
    pub decision: MailDecision,
    pub priority: Option<HistoryPriority>,
    pub summary: Option<String>,
    pub deadline: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct HistoryResponse {
    pub history: Vec<MailHistoryEntry>,
}
