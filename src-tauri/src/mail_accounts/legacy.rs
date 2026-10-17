use std::collections::BTreeMap;
use std::fs;
use std::path::Path;

use serde::Deserialize;

use crate::{json_file, secrets};

#[derive(Debug, Default, Deserialize)]
#[serde(default)]
struct LegacyNodeConfig {
    accounts: Vec<LegacyAccount>,
}

#[derive(Debug, Deserialize)]
struct LegacyAccount {
    id: String,
}

fn remove_file(path: &Path) -> Result<(), String> {
    fs::remove_file(path).map_err(|e| format!("{} を削除できません: {}", path.display(), e))
}

pub fn purge_imap_data(path: &Path) -> Result<(), String> {
    if !path.exists() {
        return Ok(());
    }

    let all: BTreeMap<String, LegacyNodeConfig> = json_file::read(path)?;
    for (node_id, config) in &all {
        for account in &config.accounts {
            secrets::delete(&format!("imap:{}:{}", node_id, account.id))?;
        }
    }
    remove_file(path)
}

pub fn purge_local_mail_accounts(path: &Path) -> Result<(), String> {
    if !path.exists() {
        return Ok(());
    }

    let all: BTreeMap<String, Vec<LegacyAccount>> = json_file::read(path)?;
    for (node_id, accounts) in &all {
        for account in accounts {
            secrets::delete(&format!("mail-account:{}:{}", node_id, account.id))?;
        }
    }
    remove_file(path)
}
