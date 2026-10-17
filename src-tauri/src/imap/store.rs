use std::collections::BTreeMap;
use std::path::PathBuf;
use std::sync::Mutex;

use super::model::{
    ImapAccountInput, ImapAccountView, ImapConfigView, ImapNodeConfig, ImapSettings,
};
use crate::{json_file, secrets};

type ConfigMap = BTreeMap<String, ImapNodeConfig>;

fn secret_key(node_id: &str, account_id: &str) -> String {
    format!("imap:{}:{}", node_id, account_id)
}

pub struct ImapStore {
    path: PathBuf,
    lock: Mutex<()>,
}

impl ImapStore {
    pub fn new(path: PathBuf) -> Self {
        Self {
            path,
            lock: Mutex::new(()),
        }
    }

    fn read_all(&self) -> Result<ConfigMap, String> {
        json_file::read(&self.path)
    }

    fn write_all(&self, all: &ConfigMap) -> Result<(), String> {
        json_file::write(&self.path, all)
    }

    fn view(node_id: &str, config: &ImapNodeConfig) -> Result<ImapConfigView, String> {
        let accounts = config
            .accounts
            .iter()
            .map(|account| {
                Ok(ImapAccountView {
                    account: account.clone(),
                    password_set: secrets::exists(&secret_key(node_id, &account.id))?,
                })
            })
            .collect::<Result<Vec<_>, String>>()?;

        Ok(ImapConfigView {
            accounts,
            settings: config.settings.clone(),
        })
    }

    pub fn load(&self, node_id: &str) -> Result<ImapConfigView, String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        let config = self.read_all()?.remove(node_id).unwrap_or_default();
        Self::view(node_id, &config)
    }

    pub fn save_account(
        &self,
        node_id: &str,
        input: ImapAccountInput,
    ) -> Result<ImapConfigView, String> {
        let (account, password) = input.into_account()?;
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;

        let mut all = self.read_all()?;
        let config = all.entry(node_id.to_string()).or_default();

        let lowered = account.name.to_lowercase();
        if config
            .accounts
            .iter()
            .any(|a| a.id != account.id && a.name.to_lowercase() == lowered)
        {
            return Err("同じ名前のアカウントが既に登録されています".into());
        }

        let position = config.accounts.iter().position(|a| a.id == account.id);
        if position.is_none() && password.is_none() {
            return Err("パスワードを入力してください".into());
        }

        if let Some(password) = &password {
            secrets::set(&secret_key(node_id, &account.id), password)?;
        }

        match position {
            Some(index) => config.accounts[index] = account,
            None => config.accounts.push(account),
        }
        let saved = config.clone();
        self.write_all(&all)?;

        Self::view(node_id, &saved)
    }

    pub fn delete_account(
        &self,
        node_id: &str,
        account_id: &str,
    ) -> Result<ImapConfigView, String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;

        let mut all = self.read_all()?;
        let config = all.entry(node_id.to_string()).or_default();
        config.accounts.retain(|a| a.id != account_id);
        let saved = config.clone();
        self.write_all(&all)?;
        secrets::delete(&secret_key(node_id, account_id))?;

        Self::view(node_id, &saved)
    }

    pub fn save_settings(
        &self,
        node_id: &str,
        settings: ImapSettings,
    ) -> Result<ImapConfigView, String> {
        settings.validate()?;
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;

        let mut all = self.read_all()?;
        let config = all.entry(node_id.to_string()).or_default();
        config.settings = settings;
        let saved = config.clone();
        self.write_all(&all)?;

        Self::view(node_id, &saved)
    }

    pub fn delete_node(&self, node_id: &str) -> Result<(), String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;

        let mut all = self.read_all()?;
        let Some(config) = all.remove(node_id) else {
            return Ok(());
        };
        self.write_all(&all)?;
        for account in &config.accounts {
            secrets::delete(&secret_key(node_id, &account.id))?;
        }
        Ok(())
    }
}
