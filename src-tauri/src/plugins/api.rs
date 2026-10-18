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
const ROUTE_TIMEOUT: Duration = Duration::from_secs(60);
const RESERVED_FIRST_SEGMENTS: [&str; 4] = ["enable", "disable", "settings", "front"];

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

fn plugin_route_path(plugin_id: &str, path: &str) -> Result<String, ApiError> {
    let invalid = |reason: &str| ApiError::Other(format!("プラグインの API パスが不正です: {reason}"));

    if !path.starts_with('/') {
        return Err(invalid("/ から始めてください"));
    }
    if path.chars().any(|c| c.is_control() || c == '#' || c == '\\') {
        return Err(invalid("使用できない文字が含まれています"));
    }

    let (route, query) = match path.split_once('?') {
        Some((route, query)) => (route, Some(query)),
        None => (path, None),
    };

    if route != "/" {
        for (index, part) in route[1..].split('/').enumerate() {
            let lowered = part.to_ascii_lowercase();
            if part.is_empty() || part == "." || part == ".." {
                return Err(invalid("空の区間や . / .. は使えません"));
            }
            if lowered.contains("%2e") || lowered.contains("%2f") || lowered.contains("%5c") {
                return Err(invalid("エンコードされた . / / は使えません"));
            }
            if index == 0 && RESERVED_FIRST_SEGMENTS.contains(&part) {
                return Err(invalid("このパスはホスト用に予約されています"));
            }
        }
    }

    let suffix = if route == "/" { "" } else { route };
    let mut result = format!("/plugins/{}{}", segment(plugin_id), suffix);
    if let Some(query) = query {
        result.push('?');
        result.push_str(query);
    }
    Ok(result)
}

pub async fn call_plugin_route(
    target: &NodeTarget,
    plugin_id: &str,
    method: &str,
    path: &str,
    body: Option<Value>,
) -> Result<Value, ApiError> {
    let method = match method {
        "GET" => Method::GET,
        "POST" => Method::POST,
        "PUT" => Method::PUT,
        "DELETE" => Method::DELETE,
        other => {
            return Err(ApiError::Other(format!(
                "プラグインの API で使えないメソッドです: {other}"
            )));
        }
    };
    let route = plugin_route_path(plugin_id, path)?;
    let text = request(target, method, &route, body, ROUTE_TIMEOUT)
        .await?
        .text()
        .await
        .map_err(|e| ApiError::Other(format!("応答を読み取れません: {e}")))?;

    if text.trim().is_empty() {
        return Ok(Value::Null);
    }
    Ok(serde_json::from_str(&text).unwrap_or(Value::String(text)))
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

#[cfg(test)]
mod tests {
    use super::plugin_route_path;

    #[test]
    fn accepts_plugin_routes() {
        assert_eq!(plugin_route_path("zen", "/").ok().unwrap(), "/plugins/zen");
        assert_eq!(plugin_route_path("zen", "/run").ok().unwrap(), "/plugins/zen/run");
        assert_eq!(
            plugin_route_path("zen", "/status/a?x=1&y=2").ok().unwrap(),
            "/plugins/zen/status/a?x=1&y=2"
        );
    }

    #[test]
    fn rejects_reserved_and_unsafe_paths() {
        for path in [
            "run",
            "",
            "/enable",
            "/settings",
            "/front/index.js",
            "/disable",
            "/a/../b",
            "/./a",
            "/a//b",
            "/a/",
            "/%2e%2e/x",
            "/a%2Fb",
            "/a\\b",
            "/a#b",
            "/a\nb",
        ] {
            assert!(plugin_route_path("zen", path).is_err(), "{path:?} は拒否されるべき");
        }
    }
}
