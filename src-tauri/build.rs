use std::fs;

const EMBEDDED_ENV_KEYS: [&str; 2] = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];

fn main() {
    println!("cargo:rerun-if-changed=.env");
    for key in EMBEDDED_ENV_KEYS {
        println!("cargo:rerun-if-env-changed={key}");
    }

    if let Ok(content) = fs::read_to_string(".env") {
        for line in content.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            let Some((key, value)) = line.split_once('=') else {
                continue;
            };
            let key = key.trim();
            let value = value.trim().trim_matches('"');
            if EMBEDDED_ENV_KEYS.contains(&key) && std::env::var_os(key).is_none() {
                println!("cargo:rustc-env={key}={value}");
            }
        }
    }

    tauri_build::build()
}
