use std::collections::BTreeMap;
use std::path::PathBuf;
use std::sync::Mutex;

use super::model::NotificationSettings;
use crate::json_file;

type SettingsMap = BTreeMap<String, NotificationSettings>;

pub struct NotificationSettingsStore {
    path: PathBuf,
    lock: Mutex<()>,
}

impl NotificationSettingsStore {
    pub fn new(path: PathBuf) -> Self {
        Self {
            path,
            lock: Mutex::new(()),
        }
    }

    pub fn load(&self, node_id: &str) -> Result<NotificationSettings, String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        let mut all: SettingsMap = json_file::read(&self.path)?;
        Ok(all.remove(node_id).unwrap_or_default())
    }

    pub fn save(&self, node_id: &str, settings: NotificationSettings) -> Result<(), String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        let mut all: SettingsMap = json_file::read(&self.path)?;
        all.insert(node_id.to_string(), settings);
        json_file::write(&self.path, &all)
    }

    pub fn delete(&self, node_id: &str) -> Result<(), String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        let mut all: SettingsMap = json_file::read(&self.path)?;
        if all.remove(node_id).is_none() {
            return Ok(());
        }
        json_file::write(&self.path, &all)
    }
}
