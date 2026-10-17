use std::fs;
use std::io::ErrorKind;
use std::path::Path;

use serde::Serialize;
use serde::de::DeserializeOwned;

pub fn read<T: DeserializeOwned + Default>(path: &Path) -> Result<T, String> {
    let raw = match fs::read_to_string(path) {
        Ok(raw) => raw,
        Err(e) if e.kind() == ErrorKind::NotFound => return Ok(T::default()),
        Err(e) => return Err(format!("{} を読み込めません: {}", path.display(), e)),
    };

    serde_json::from_str(raw.trim_start_matches('\u{feff}'))
        .map_err(|e| format!("{} の形式が正しくありません: {}", path.display(), e))
}

pub fn write<T: Serialize + ?Sized>(path: &Path, value: &T) -> Result<(), String> {
    if let Some(dir) = path.parent() {
        fs::create_dir_all(dir).map_err(|e| format!("{} を作成できません: {}", dir.display(), e))?;
    }

    let json = serde_json::to_string_pretty(value).map_err(|e| e.to_string())?;
    let temp = path.with_extension("json.tmp");
    fs::write(&temp, json).map_err(|e| format!("{} に書き込めません: {}", temp.display(), e))?;
    fs::rename(&temp, path).map_err(|e| format!("{} を保存できません: {}", path.display(), e))
}
