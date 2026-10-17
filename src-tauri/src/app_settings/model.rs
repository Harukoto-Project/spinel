use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct AppSettings {
    pub launch_at_login: bool,
    pub start_minimized: bool,
    pub close_to_tray: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            launch_at_login: true,
            start_minimized: false,
            close_to_tray: true,
        }
    }
}
