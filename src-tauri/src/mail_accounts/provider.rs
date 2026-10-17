use serde::{Deserialize, Serialize};

use super::oauth::config::OAuthConfig;
use super::oauth::{google, outlook};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MailProvider {
    Google,
    Outlook,
}

impl MailProvider {
    pub fn oauth_config(self) -> Result<OAuthConfig, String> {
        match self {
            Self::Google => google::config(),
            Self::Outlook => outlook::config(),
        }
    }
}
