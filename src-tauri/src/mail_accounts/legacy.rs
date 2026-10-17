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
    fs::remove_file(path).map_err(|e| format!("{} を削除できません: {}", path.display(), e))
}
