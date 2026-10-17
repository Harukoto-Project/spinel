use serde_json::Value;

use super::config::{OAuthConfig, OAuthIdentity};

const AUTH_URL: &str = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const TOKEN_URL: &str = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const USERINFO_URL: &str =
    "https://graph.microsoft.com/v1.0/me?$select=displayName,mail,userPrincipalName";
const SCOPES: &[&str] = &[
    "openid",
    "offline_access",
    "https://graph.microsoft.com/User.Read",
    "https://graph.microsoft.com/Mail.Read",
];
const AUTH_PARAMS: &[(&str, &str)] = &[("prompt", "select_account")];

fn embedded(value: Option<&'static str>) -> Option<&'static str> {
    value.map(str::trim).filter(|v| !v.is_empty())
}

fn non_empty(value: &Value, key: &str) -> Option<String> {
    value
        .get(key)
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|v| !v.is_empty())
        .map(str::to_string)
}

fn parse_identity(value: &Value) -> Option<OAuthIdentity> {
    let email = non_empty(value, "mail").or_else(|| non_empty(value, "userPrincipalName"))?;
    let name = non_empty(value, "displayName")
        .unwrap_or_else(|| email.split('@').next().unwrap_or(&email).to_string());
    Some(OAuthIdentity { email, name })
}

pub fn config() -> Result<OAuthConfig, String> {
    let client_id = embedded(option_env!("OUTLOOK_CLIENT_ID")).ok_or(
        "Outlook のクライアントID(アプリケーション ID)が設定されていません。src-tauri/.env に OUTLOOK_CLIENT_ID を設定してビルドし直してください",
    )?;

    Ok(OAuthConfig {
        client_id: client_id.to_string(),
        client_secret: None,
        redirect_host: "localhost",
        auth_url: AUTH_URL,
        token_url: TOKEN_URL,
        userinfo_url: USERINFO_URL,
        scopes: SCOPES,
        auth_params: AUTH_PARAMS,
        parse_identity,
    })
}
