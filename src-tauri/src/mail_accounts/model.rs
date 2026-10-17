use serde::{Deserialize, Serialize};

use super::provider::MailProvider;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MailAccount {
    pub id: String,
    pub provider: MailProvider,
    pub email: String,
    pub name: String,
    pub connected_at: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MailAccountView {
    #[serde(flatten)]
    pub account: MailAccount,
    pub connected: bool,
}
