use keyring::{Entry, Error};

const SERVICE: &str = "spinel";

fn entry(key: &str) -> Result<Entry, String> {
    Entry::new(SERVICE, key).map_err(|e| format!("資格情報ストアを開けません: {}", e))
}

pub fn set(key: &str, value: &str) -> Result<(), String> {
    entry(key)?
        .set_password(value)
        .map_err(|e| format!("資格情報ストアに保存できません: {}", e))
}

pub fn get(key: &str) -> Result<Option<String>, String> {
    match entry(key)?.get_password() {
        Ok(value) => Ok(Some(value)),
        Err(Error::NoEntry) => Ok(None),
        Err(e) => Err(format!("資格情報ストアを読み取れません: {}", e)),
    }
}

pub fn exists(key: &str) -> Result<bool, String> {
    match entry(key)?.get_password() {
        Ok(_) => Ok(true),
        Err(Error::NoEntry) => Ok(false),
        Err(e) => Err(format!("資格情報ストアを読み取れません: {}", e)),
    }
}

pub fn delete(key: &str) -> Result<(), String> {
    match entry(key)?.delete_credential() {
        Ok(()) | Err(Error::NoEntry) => Ok(()),
        Err(e) => Err(format!("資格情報ストアから削除できません: {}", e)),
    }
}
