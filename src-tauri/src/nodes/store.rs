use std::fs;
use std::io::ErrorKind;
use std::path::PathBuf;
use std::sync::Mutex;

use super::model::StoredNode;

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

        let raw = match fs::read_to_string(&self.path) {
            Ok(raw) => raw,
            Err(e) if e.kind() == ErrorKind::NotFound => return Ok(Vec::new()),
            Err(e) => return Err(format!("{} を読み込めません: {}", self.path.display(), e)),
        };

        serde_json::from_str(raw.trim_start_matches('\u{feff}'))
            .map_err(|e| format!("{} の形式が正しくありません: {}", self.path.display(), e))
    }

    pub fn save(&self, nodes: &[StoredNode]) -> Result<(), String> {
        let _guard = self.lock.lock().map_err(|e| e.to_string())?;

        if let Some(dir) = self.path.parent() {
            fs::create_dir_all(dir)
                .map_err(|e| format!("{} を作成できません: {}", dir.display(), e))?;
        }

        let json = serde_json::to_string_pretty(nodes).map_err(|e| e.to_string())?;
        let temp = self.path.with_extension("json.tmp");
        fs::write(&temp, json)
            .map_err(|e| format!("{} に書き込めません: {}", temp.display(), e))?;
        fs::rename(&temp, &self.path)
            .map_err(|e| format!("{} を保存できません: {}", self.path.display(), e))
    }
}
