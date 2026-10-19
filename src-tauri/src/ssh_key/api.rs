use reqwest::Method;

use super::model::SshKeyView;
use crate::mail_accounts::api::{NodeTarget, send};
use crate::notifications::api::ApiError;

pub async fn load_key(target: &NodeTarget) -> Result<SshKeyView, ApiError> {
    send(target, Method::GET, "/ssh-key", None).await
}

pub async fn regenerate_key(target: &NodeTarget) -> Result<SshKeyView, ApiError> {
    send(target, Method::POST, "/ssh-key/regenerate", None).await
}
