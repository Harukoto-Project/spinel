use std::path::PathBuf;
use std::sync::Mutex;

use super::model::ReceivedNotification;
use crate::json_file;

const MAX_HISTORY: usize = 200;

pub struct NotificationHistoryStore {
    path: PathBuf,
    lock: Mutex<()>,
}

impl NotificationHistoryStore {
    pub fn new(path: PathBuf) -> Self {
        Self {
            path,
            lock: Mutex::new(()),
        }
    }

    pub fn list(&self) -> Result<Vec<ReceivedNotification>, String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        json_file::read(&self.path)
    }

    pub fn push(&self, record: ReceivedNotification) -> Result<(), String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        let mut all: Vec<ReceivedNotification> = json_file::read(&self.path)?;
        all.insert(0, record);
        all.truncate(MAX_HISTORY);
        json_file::write(&self.path, &all)
    }

    pub fn clear(&self) -> Result<(), String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        json_file::write(&self.path, &Vec::<ReceivedNotification>::new())
    }
}
