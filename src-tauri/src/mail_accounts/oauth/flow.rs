use std::time::Duration;

use serde::Deserialize;
use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

use super::config::{OAuthConfig, OAuthGrant, OAuthIdentity};
use super::loopback::LoopbackServer;
use super::pkce;

const AUTH_TIMEOUT: Duration = Duration::from_secs(180);

#[derive(Deserialize)]
struct TokenResponse {
    access_token: String,
    refresh_token: Option<String>,
}

pub async fn authorize(app: &AppHandle, config: &OAuthConfig) -> Result<OAuthGrant, String> {
    let server = LoopbackServer::bind(config.redirect_host).await?;
    let redirect_uri = server.redirect_uri.clone();
    let pkce = pkce::generate();
    let state = pkce::random_token();

    let auth_url = build_auth_url(config, &redirect_uri, &state, &pkce.challenge)?;
    app.opener()
        .open_url(auth_url.as_str(), None::<&str>)
        .map_err(|e| format!("ブラウザを開けませんでした: {e}"))?;

    let callback = server.wait_for_callback(AUTH_TIMEOUT).await?;
    if let Some(error) = callback.error {
        return Err(describe_callback_error(&error));
    }
    if callback.state.as_deref() != Some(state.as_str()) {
        return Err("認証の状態が一致しません。もう一度お試しください".into());
    }
    let code = callback
        .code
        .ok_or("認証コードを受け取れませんでした")?;

    let client = reqwest::Client::new();
    let tokens = exchange_code(&client, config, &code, &redirect_uri, &pkce.verifier).await?;
    let identity = fetch_identity(&client, config, &tokens.access_token).await?;
    let refresh_token = tokens.refresh_token.ok_or(
        "リフレッシュトークンを取得できませんでした。アカウントのアクセス許可を解除してから、もう一度お試しください",
    )?;

    Ok(OAuthGrant {
        refresh_token,
        identity,
    })
}

fn build_auth_url(
    config: &OAuthConfig,
    redirect_uri: &str,
    state: &str,
    challenge: &str,
) -> Result<url::Url, String> {
    let mut url = url::Url::parse(config.auth_url).map_err(|e| e.to_string())?;
    {
        let mut query = url.query_pairs_mut();
        query
            .append_pair("client_id", &config.client_id)
            .append_pair("redirect_uri", redirect_uri)
            .append_pair("response_type", "code")
            .append_pair("scope", &config.scopes.join(" "))
            .append_pair("state", state)
            .append_pair("code_challenge", challenge)
            .append_pair("code_challenge_method", "S256");
        for (key, value) in config.auth_params {
            query.append_pair(key, value);
        }
    }
    Ok(url)
}

fn describe_callback_error(error: &str) -> String {
    match error {
        "access_denied" => "アクセスが許可されませんでした".into(),
        other => format!("認証に失敗しました ({other})"),
    }
}

async fn exchange_code(
    client: &reqwest::Client,
    config: &OAuthConfig,
    code: &str,
    redirect_uri: &str,
    verifier: &str,
) -> Result<TokenResponse, String> {
    let mut form = vec![
        ("grant_type", "authorization_code"),
        ("code", code),
        ("redirect_uri", redirect_uri),
        ("client_id", config.client_id.as_str()),
        ("code_verifier", verifier),
    ];
    if let Some(secret) = &config.client_secret {
        form.push(("client_secret", secret.as_str()));
    }

    let response = client
        .post(config.token_url)
        .form(&form)
        .send()
        .await
        .map_err(|e| format!("トークンの取得に失敗しました: {e}"))?;

    let status = response.status();
    if !status.is_success() {
        let body = response.text().await.unwrap_or_default();
        return Err(format!("トークンの取得に失敗しました ({status}): {body}"));
    }

    response
        .json::<TokenResponse>()
        .await
        .map_err(|e| format!("トークンの応答を解釈できません: {e}"))
}

async fn fetch_identity(
    client: &reqwest::Client,
    config: &OAuthConfig,
    access_token: &str,
) -> Result<OAuthIdentity, String> {
    let response = client
        .get(config.userinfo_url)
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(|e| format!("アカウント情報の取得に失敗しました: {e}"))?;

    let status = response.status();
    if !status.is_success() {
        return Err(format!("アカウント情報の取得に失敗しました ({status})"));
    }

    let value = response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("アカウント情報を解釈できません: {e}"))?;

    (config.parse_identity)(&value).ok_or_else(|| "アカウントのメールアドレスを取得できませんでした".into())
}
