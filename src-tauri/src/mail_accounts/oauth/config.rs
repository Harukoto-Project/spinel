use serde_json::Value;

#[derive(Debug, Clone)]
pub struct OAuthIdentity {
    pub email: String,
    pub name: String,
}

pub struct OAuthConfig {
    pub client_id: String,
    pub client_secret: Option<String>,
    pub redirect_host: &'static str,
    pub auth_url: &'static str,
    pub token_url: &'static str,
    pub userinfo_url: &'static str,
    pub scopes: &'static [&'static str],
    pub auth_params: &'static [(&'static str, &'static str)],
    pub parse_identity: fn(&Value) -> Option<OAuthIdentity>,
}

#[derive(Debug, Clone)]
pub struct OAuthGrant {
    pub refresh_token: String,
    pub identity: OAuthIdentity,
}
