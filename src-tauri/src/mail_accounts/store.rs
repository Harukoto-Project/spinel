use std::collections::BTreeMap;
use std::path::PathBuf;
use std::sync::Mutex;

use uuid::Uuid;

use super::model::{MailAccount, MailAccountView};
use super::oauth::config::OAuthGrant;
use super::provider::MailProvider;
use crate::notifications::clock::now_ms;
use crate::{json_file, secrets};

type AccountMap = BTreeMap<String, Vec<MailAccount>>;

fn secret_key(node_id: &str, account_id: &str) -> String {
    format!("mail-account:{}:{}", node_id, account_id)
}

pub struct MailAccountStore {
    path: PathBuf,
    lock: Mutex<()>,
}

impl MailAccountStore {
    pub fn new(path: PathBuf) -> Self {
        Self {
            path,
            lock: Mutex::new(()),
        }
    }

    fn read_all(&self) -> Result<AccountMap, String> {
        json_file::read(&self.path)
    }

    fn write_all(&self, all: &AccountMap) -> Result<(), String> {
        json_file::write(&self.path, all)
    }

    fn view(node_id: &str, accounts: &[MailAccount]) -> Result<Vec<MailAccountView>, String> {
        accounts
            .iter()
            .map(|account| {
                Ok(MailAccountView {
                    account: account.clone(),
                    connected: secrets::exists(&secret_key(node_id, &account.id))?,
                })
            })
            .collect()
    }

    pub fn load(&self, node_id: &str) -> Result<Vec<MailAccountView>, String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        let accounts = self.read_all()?.remove(node_id).unwrap_or_default();
        Self::view(node_id, &accounts)
    }

    pub fn connect(
        &self,
        node_id: &str,
        provider: MailProvider,
        grant: OAuthGrant,
    ) -> Result<Vec<MailAccountView>, String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;

        let mut all = self.read_all()?;
        let accounts = all.entry(node_id.to_string()).or_default();

        let existing = accounts.iter().position(|a| {
            a.provider == provider && a.email.eq_ignore_ascii_case(&grant.identity.email)
        });
        let id = match existing {
            Some(index) => accounts[index].id.clone(),
            None => Uuid::new_v4().to_string(),
        };

        secrets::set(&secret_key(node_id, &id), &grant.refresh_token)?;

        let account = MailAccount {
            id,
            provider,
            email: grant.identity.email,
            name: grant.identity.name,
            connected_at: now_ms(),
        };
        match existing {
            Some(index) => accounts[index] = account,
            None => accounts.push(account),
        }

        let saved = accounts.clone();
        self.write_all(&all)?;
        Self::view(node_id, &saved)
    }

    pub fn delete_account(
        &self,
        node_id: &str,
        account_id: &str,
    ) -> Result<Vec<MailAccountView>, String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;

        let mut all = self.read_all()?;
        let accounts = all.entry(node_id.to_string()).or_default();
        accounts.retain(|a| a.id != account_id);
        let saved = accounts.clone();
        self.write_all(&all)?;
        secrets::delete(&secret_key(node_id, account_id))?;

        Self::view(node_id, &saved)
    }

    pub fn delete_node(&self, node_id: &str) -> Result<(), String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;

        let mut all = self.read_all()?;
        let Some(accounts) = all.remove(node_id) else {
            return Ok(());
        };
        self.write_all(&all)?;
        for account in &accounts {
            secrets::delete(&secret_key(node_id, &account.id))?;
        }
        Ok(())
    }
}
