use std::time::Duration;

use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

use super::loopback::LoopbackServer;
use super::pkce;
use crate::mail_accounts::api::{self, NodeTarget};
use crate::mail_accounts::model::MailAccountView;
use crate::mail_accounts::provider::MailProvider;
use crate::notifications::api::ApiError;

const AUTH_TIMEOUT: Duration = Duration::from_secs(180);

pub async fn authorize(
    app: &AppHandle,
    target: &NodeTarget,
    provider: MailProvider,
) -> Result<Vec<MailAccountView>, String> {
    let server = LoopbackServer::bind(provider.redirect_host()).await?;
    let redirect_uri = server.redirect_uri.clone();
    let pkce = pkce::generate();
    let state = pkce::random_token();

    let auth_url = api::start_oauth(target, provider, &redirect_uri, &state, &pkce.challenge)
        .await
        .map_err(ApiError::into_message)?;
    let auth_url = parse_auth_url(&auth_url)?;
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
    let code = callback.code.ok_or("認証コードを受け取れませんでした")?;

    api::complete_oauth(target, provider, &code, &pkce.verifier, &redirect_uri)
        .await
        .map_err(ApiError::into_message)
}

fn parse_auth_url(raw: &str) -> Result<url::Url, String> {
    let url = url::Url::parse(raw).map_err(|_| "ノードが返した認証URLを解釈できません".to_string())?;
    if url.scheme() != "https" {
        return Err("ノードが返した認証URLが https ではないため、開きませんでした".into());
    }
    Ok(url)
}

fn describe_callback_error(error: &str) -> String {
    match error {
        "access_denied" => "アクセスが許可されませんでした".into(),
        other => format!("認証に失敗しました ({other})"),
    }
}
