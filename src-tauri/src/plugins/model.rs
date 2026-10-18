use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginPermissions {
    pub routes: bool,
    pub storage: bool,
    pub notify: bool,
    pub process: bool,
    pub build: bool,
    pub network: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginSummaryView {
    pub id: String,
    pub name: String,
    pub version: String,
    pub description: Option<String>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginRepositoryView {
    pub id: String,
    pub url: String,
    pub name: String,
    pub installed_sha: String,
    pub updated_at: i64,
    pub plugins: Vec<PluginSummaryView>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginView {
    pub id: String,
    pub repo_id: String,
    pub name: String,
    pub version: String,
    pub description: Option<String>,
    pub has_server: bool,
    pub has_front: bool,
    pub enabled: bool,
    pub status: String,
    pub error_message: Option<String>,
    pub restart_required: bool,
    pub permissions: PluginPermissions,
    pub granted_permissions: Option<PluginPermissions>,
    pub settings: Vec<Value>,
    pub setting_values: HashMap<String, Value>,
    pub secrets_set: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct RepositoriesResponse {
    pub repositories: Vec<PluginRepositoryView>,
}

#[derive(Debug, Deserialize)]
pub struct PluginsResponse {
    pub plugins: Vec<PluginView>,
}
