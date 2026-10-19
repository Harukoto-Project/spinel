use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SshKeyView {
    pub public_key: String,
    pub fingerprint: String,
    pub created_at: i64,
}
