use serde::{Deserialize, Serialize};

pub const LOOKBACK_DAYS_RANGE: (u32, u32) = (1, 365);
pub const FETCH_LIMIT_RANGE: (u32, u32) = (1, 500);
pub const POLL_INTERVAL_SEC_RANGE: (u32, u32) = (10, 86_400);

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImapAccount {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: u16,
    pub user: String,
    pub secure: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImapSettings {
    pub lookback_days: u32,
    pub fetch_limit: u32,
    pub poll_interval_sec: u32,
}

impl Default for ImapSettings {
    fn default() -> Self {
        Self {
            lookback_days: 2,
            fetch_limit: 20,
            poll_interval_sec: 300,
        }
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct ImapNodeConfig {
    pub accounts: Vec<ImapAccount>,
    pub settings: ImapSettings,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImapAccountInput {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: u16,
    pub user: String,
    pub secure: bool,
    pub password: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImapAccountView {
    #[serde(flatten)]
    pub account: ImapAccount,
    pub password_set: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImapConfigView {
    pub accounts: Vec<ImapAccountView>,
    pub settings: ImapSettings,
}

fn check_range(label: &str, value: u32, (min, max): (u32, u32)) -> Result<(), String> {
    if value < min || value > max {
        return Err(format!("{} は {} 〜 {} の範囲で指定してください", label, min, max));
    }
    Ok(())
}

impl ImapAccountInput {
    pub fn into_account(self) -> Result<(ImapAccount, Option<String>), String> {
        let name = self.name.trim().to_string();
        let host = self.host.trim().to_string();
        let user = self.user.trim().to_string();

        if self.id.trim().is_empty() {
            return Err("アカウントIDが指定されていません".into());
        }
        if name.is_empty() {
            return Err("アカウント名を入力してください".into());
        }
        if user.is_empty() {
            return Err("メールアドレスを入力してください".into());
        }
        if host.is_empty() {
            return Err("IMAPサーバーを入力してください".into());
        }
        if self.port == 0 {
            return Err("ポートは 1 〜 65535 の範囲で指定してください".into());
        }

        let password = self.password.filter(|p| !p.is_empty());
        Ok((
            ImapAccount {
                id: self.id,
                name,
                host,
                port: self.port,
                user,
                secure: self.secure,
            },
            password,
        ))
    }
}

impl ImapSettings {
    pub fn validate(&self) -> Result<(), String> {
        check_range("取得対象の期間(日)", self.lookback_days, LOOKBACK_DAYS_RANGE)?;
        check_range("1回の最大取得件数", self.fetch_limit, FETCH_LIMIT_RANGE)?;
        check_range("取得間隔(秒)", self.poll_interval_sec, POLL_INTERVAL_SEC_RANGE)
    }
}
