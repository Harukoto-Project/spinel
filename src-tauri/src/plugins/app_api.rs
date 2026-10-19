use std::time::Duration;

use reqwest::Method;
use serde_json::{Value, json};

use crate::mail_accounts::api::{NodeTarget, send_with_timeout};
use crate::notifications::api::ApiError;

const APP_TIMEOUT: Duration = Duration::from_secs(30);
const SOURCE_UPDATE_TIMEOUT: Duration = Duration::from_secs(150);
const QUERY_TIMEOUT: Duration = Duration::from_secs(150);

fn segment(value: &str) -> String {
    url::form_urlencoded::byte_serialize(value.as_bytes()).collect()
}

fn validate(parts: &[&str]) -> Result<(), ApiError> {
    for part in parts {
        if part.is_empty() || *part == "." || *part == ".." {
            return Err(ApiError::Other("プラグインまたはコマンドの ID が不正です".to_string()));
        }
    }
    Ok(())
}

fn app_path(plugin_id: &str, suffix: &str) -> String {
    format!("/plugins/{}/app{}", segment(plugin_id), suffix)
}

fn command_path(plugin_id: &str, command_id: &str, action: &str) -> String {
    app_path(
        plugin_id,
        &format!("/commands/{}/{}", segment(command_id), action),
    )
}

fn inputs_body(inputs: Option<Value>) -> Value {
    match inputs {
        Some(inputs) => json!({ "inputs": inputs }),
        None => json!({}),
    }
}

pub async fn load_overview(target: &NodeTarget, plugin_id: &str) -> Result<Value, ApiError> {
    validate(&[plugin_id])?;
    let path = app_path(plugin_id, "");
    send_with_timeout(target, Method::GET, &path, None, APP_TIMEOUT).await
}

pub async fn update_source(target: &NodeTarget, plugin_id: &str) -> Result<Value, ApiError> {
    validate(&[plugin_id])?;
    let path = app_path(plugin_id, "/source/update");
    send_with_timeout(target, Method::POST, &path, None, SOURCE_UPDATE_TIMEOUT).await
}

pub async fn run_setup(target: &NodeTarget, plugin_id: &str) -> Result<Value, ApiError> {
    validate(&[plugin_id])?;
    let path = app_path(plugin_id, "/setup/run");
    send_with_timeout(target, Method::POST, &path, None, APP_TIMEOUT).await
}

pub async fn read_setup_logs(
    target: &NodeTarget,
    plugin_id: &str,
    step_id: &str,
    after: u64,
) -> Result<Value, ApiError> {
    validate(&[plugin_id, step_id])?;
    let path = app_path(
        plugin_id,
        &format!("/setup/steps/{}/logs?after={after}", segment(step_id)),
    );
    send_with_timeout(target, Method::GET, &path, None, APP_TIMEOUT).await
}

pub async fn run_command(
    target: &NodeTarget,
    plugin_id: &str,
    command_id: &str,
    inputs: Option<Value>,
) -> Result<Value, ApiError> {
    validate(&[plugin_id, command_id])?;
    let path = command_path(plugin_id, command_id, "run");
    send_with_timeout(
        target,
        Method::POST,
        &path,
        Some(inputs_body(inputs)),
        APP_TIMEOUT,
    )
    .await
}

pub async fn stop_command(
    target: &NodeTarget,
    plugin_id: &str,
    command_id: &str,
) -> Result<Value, ApiError> {
    validate(&[plugin_id, command_id])?;
    let path = command_path(plugin_id, command_id, "stop");
    send_with_timeout(target, Method::POST, &path, None, APP_TIMEOUT).await
}

pub async fn read_command_logs(
    target: &NodeTarget,
    plugin_id: &str,
    command_id: &str,
    after: u64,
) -> Result<Value, ApiError> {
    validate(&[plugin_id, command_id])?;
    let path = command_path(plugin_id, command_id, &format!("logs?after={after}"));
    send_with_timeout(target, Method::GET, &path, None, APP_TIMEOUT).await
}

pub async fn query_command(
    target: &NodeTarget,
    plugin_id: &str,
    command_id: &str,
    inputs: Option<Value>,
) -> Result<Value, ApiError> {
    validate(&[plugin_id, command_id])?;
    let path = command_path(plugin_id, command_id, "query");
    send_with_timeout(
        target,
        Method::POST,
        &path,
        Some(inputs_body(inputs)),
        QUERY_TIMEOUT,
    )
    .await
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::{app_path, command_path, inputs_body, validate};

    #[test]
    fn rejects_dot_segments() {
        assert!(validate(&["zen", ".."]).is_err());
        assert!(validate(&[".", "x"]).is_err());
        assert!(validate(&["", "x"]).is_err());
        assert!(validate(&["zen", "login"]).is_ok());
    }

    #[test]
    fn builds_app_paths() {
        assert_eq!(app_path("zen", ""), "/plugins/zen/app");
        assert_eq!(
            command_path("zen", "login", "run"),
            "/plugins/zen/app/commands/login/run"
        );
        assert_eq!(
            command_path("zen", "logs", "logs?after=3"),
            "/plugins/zen/app/commands/logs/logs?after=3"
        );
    }

    #[test]
    fn encodes_unsafe_segments() {
        assert_eq!(
            app_path("a/b", "/x"),
            "/plugins/a%2Fb/app/x"
        );
        assert_eq!(
            command_path("zen", "../x", "run"),
            "/plugins/zen/app/commands/..%2Fx/run"
        );
    }

    #[test]
    fn wraps_inputs() {
        assert_eq!(inputs_body(None), json!({}));
        assert_eq!(
            inputs_body(Some(json!({ "month": "9" }))),
            json!({ "inputs": { "month": "9" } })
        );
    }
}
