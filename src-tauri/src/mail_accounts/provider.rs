use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MailProvider {
    Google,
    Outlook,
}

impl MailProvider {
    pub fn redirect_host(self) -> &'static str {
        match self {
            Self::Google => "127.0.0.1",
            Self::Outlook => "localhost",
        }
    }
}
