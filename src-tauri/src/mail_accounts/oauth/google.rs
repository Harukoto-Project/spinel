use serde_json::Value;

use super::config::{OAuthConfig, OAuthIdentity};

const AUTH_URL: &str = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL: &str = "https://oauth2.googleapis.com/token";
const USERINFO_URL: &str = "https://openidconnect.googleapis.com/v1/userinfo";
const SCOPES: &[&str] = &[
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/gmail.readonly",
];
const AUTH_PARAMS: &[(&str, &str)] = &[("access_type", "offline"), ("prompt", "consent")];

fn embedded(value: Option<&'static str>) -> Option<&'static str> {
    value.map(str::trim).filter(|v| !v.is_empty())
}

fn parse_identity(value: &Value) -> Option<OAuthIdentity> {
    let email = value.get("email")?.as_str()?.trim().to_string();
    if email.is_empty() {
        return None;
    }
    let name = value
        .get("name")
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|name| !name.is_empty())
        .map(str::to_string)
        .unwrap_or_else(|| email.split('@').next().unwrap_or(&email).to_string());
    Some(OAuthIdentity { email, name })
}

pub fn config() -> Result<OAuthConfig, String> {
    let client_id = embedded(option_env!("GOOGLE_CLIENT_ID")).ok_or(
        "Google のクライアントIDが設定されていません。src-tauri/.env に GOOGLE_CLIENT_ID を設定してビルドし直してください",
    )?;

    Ok(OAuthConfig {
        client_id: client_id.to_string(),
        client_secret: embedded(option_env!("GOOGLE_CLIENT_SECRET")).map(str::to_string),
        redirect_host: "127.0.0.1",
        auth_url: AUTH_URL,
        token_url: TOKEN_URL,
        userinfo_url: USERINFO_URL,
        scopes: SCOPES,
        auth_params: AUTH_PARAMS,
        parse_identity,
    })
}
