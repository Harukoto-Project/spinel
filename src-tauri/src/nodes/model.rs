use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StoredNode {
    pub id: String,
    pub name: String,
    pub address: String,
    pub last_seen_at: Option<String>,
}
