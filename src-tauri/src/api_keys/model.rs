use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ApiKeyId {
    Typesafe,
    Anthropic,
}

impl ApiKeyId {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Typesafe => "typesafe",
            Self::Anthropic => "anthropic",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ApiKeySource {
    App,
    Env,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiKeyStatus {
    pub configured: bool,
    pub source: Option<ApiKeySource>,
}

pub type ApiKeyStatusMap = HashMap<String, ApiKeyStatus>;

#[derive(Debug, Deserialize)]
pub struct KeysResponse {
    pub keys: ApiKeyStatusMap,
}
