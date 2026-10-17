use std::path::PathBuf;
use std::sync::Mutex;

use super::model::StoredNode;
use crate::json_file;

pub struct NodeStore {
    path: PathBuf,
    lock: Mutex<()>,
}

impl NodeStore {
    pub fn new(path: PathBuf) -> Self {
        Self {
            path,
            lock: Mutex::new(()),
        }
    }

    pub fn load(&self) -> Result<Vec<StoredNode>, String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        json_file::read(&self.path)
    }

    pub fn save(&self, nodes: &[StoredNode]) -> Result<(), String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;
        json_file::write(&self.path, nodes)
    }
}
