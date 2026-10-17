use std::path::PathBuf;
use std::sync::Mutex;

use super::model::AppSettings;
use crate::json_file;

pub struct AppSettingsStore {
    path: PathBuf,
    lock: Mutex<()>,
}

impl AppSettingsStore {
    pub fn new(path: PathBuf) -> Self {
        Self {
            path,
            lock: Mutex::new(()),
        }
    }

    pub fn load(&self) -> Result<AppSettings, String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        json_file::read(&self.path)
    }

    pub fn save(&self, settings: &AppSettings) -> Result<(), String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        json_file::write(&self.path, settings)
    }
}
