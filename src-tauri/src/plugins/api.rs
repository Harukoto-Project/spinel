use std::collections::HashMap;
use std::time::Duration;

use reqwest::Method;
use serde_json::{Value, json};

use super::model::{
    PluginPermissions, PluginRepositoryView, PluginView, PluginsResponse, RepositoriesResponse,
};
use crate::mail_accounts::api::{NodeTarget, request, send, send_with_timeout};
use crate::notifications::api::ApiError;

const FETCH_TIMEOUT: Duration = Duration::from_secs(150);
const ASSET_TIMEOUT: Duration = Duration::from_secs(30);

fn segment(value: &str) -> String {
    url::form_urlencoded::byte_serialize(value.as_bytes()).collect()
}

pub async fn load_repositories(
    target: &NodeTarget,
) -> Result<Vec<PluginRepositoryView>, ApiError> {
    let response: RepositoriesResponse =
        send(target, Method::GET, "/plugin-repositories", None).await?;
    Ok(response.repositories)
}

pub async fn add_repository(
    target: &NodeTarget,
    url: &str,
) -> Result<Vec<PluginRepositoryView>, ApiError> {
    let response: RepositoriesResponse = send_with_timeout(
        target,
        Method::POST,
        "/plugin-repositories",
        Some(json!({ "url": url })),
        FETCH_TIMEOUT,
    )
    .await?;
    Ok(response.repositories)
}

pub async fn refresh_repository(
    target: &NodeTarget,
    repo_id: &str,
) -> Result<Vec<PluginRepositoryView>, ApiError> {
    let path = format!("/plugin-repositories/{}/refresh", segment(repo_id));
    let response: RepositoriesResponse =
        send_with_timeout(target, Method::POST, &path, None, FETCH_TIMEOUT).await?;
    Ok(response.repositories)
}

pub async fn delete_repository(
    target: &NodeTarget,
    repo_id: &str,
) -> Result<Vec<PluginRepositoryView>, ApiError> {
    let path = format!("/plugin-repositories/{}", segment(repo_id));
    let response: RepositoriesResponse = send(target, Method::DELETE, &path, None).await?;
    Ok(response.repositories)
}

pub async fn load_plugins(target: &NodeTarget) -> Result<Vec<PluginView>, ApiError> {
    let response: PluginsResponse = send(target, Method::GET, "/plugins", None).await?;
    Ok(response.plugins)
}

pub async fn enable_plugin(
    target: &NodeTarget,
    plugin_id: &str,
    granted: &PluginPermissions,
) -> Result<Vec<PluginView>, ApiError> {
    let path = format!("/plugins/{}/enable", segment(plugin_id));
    let response: PluginsResponse = send_with_timeout(
        target,
        Method::POST,
        &path,
        Some(json!({ "grantedPermissions": granted })),
        FETCH_TIMEOUT,
    )
    .await?;
    Ok(response.plugins)
}

pub async fn disable_plugin(
    target: &NodeTarget,
    plugin_id: &str,
) -> Result<Vec<PluginView>, ApiError> {
    let path = format!("/plugins/{}/disable", segment(plugin_id));
    let response: PluginsResponse = send(target, Method::POST, &path, None).await?;
    Ok(response.plugins)
}

pub async fn save_settings(
    target: &NodeTarget,
    plugin_id: &str,
    values: &HashMap<String, Value>,
) -> Result<Vec<PluginView>, ApiError> {
    let path = format!("/plugins/{}/settings", segment(plugin_id));
    let response: PluginsResponse = send(
        target,
        Method::PUT,
        &path,
        Some(json!({ "values": values })),
    )
    .await?;
    Ok(response.plugins)
}

pub async fn fetch_front_asset(
    target: &NodeTarget,
    plugin_id: &str,
    asset_path: &str,
) -> Result<String, ApiError> {
    let encoded: Vec<String> = asset_path.split('/').map(segment).collect();
    let path = format!("/plugins/{}/front/{}", segment(plugin_id), encoded.join("/"));
    request(target, Method::GET, &path, None, ASSET_TIMEOUT)
        .await?
        .text()
        .await
        .map_err(|e| ApiError::Other(format!("ファイルを読み取れません: {e}")))
}
