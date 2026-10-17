use std::collections::HashMap;
use std::sync::Mutex;

use tauri::{AppHandle, Emitter};

use super::clock::now_ms;
use super::model::{ConnectionState, ConnectionStatus};

pub const CONNECTION_EVENT: &str = "notification-connection";

#[derive(Default)]
pub struct StatusBoard {
    statuses: Mutex<HashMap<String, ConnectionStatus>>,
}

impl StatusBoard {
    pub fn set(
        &self,
        app: &AppHandle,
        node_id: &str,
        state: ConnectionState,
        message: Option<String>,
    ) {
        let status = ConnectionStatus {
            node_id: node_id.to_string(),
            state,
            message,
            updated_at: now_ms(),
        };
        self.statuses
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .insert(node_id.to_string(), status.clone());
        let _ = app.emit(CONNECTION_EVENT, &status);
    }

    pub fn remove(&self, node_id: &str) {
        self.statuses
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .remove(node_id);
    }

    pub fn all(&self) -> Vec<ConnectionStatus> {
        self.statuses
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .values()
            .cloned()
            .collect()
    }
}
