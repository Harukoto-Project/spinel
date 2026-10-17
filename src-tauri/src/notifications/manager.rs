use std::collections::{HashMap, HashSet};
use std::sync::{Arc, Mutex};

use tauri::async_runtime::{JoinHandle, spawn};
use tauri::{AppHandle, Manager};

use super::connection;
use super::model::{ConnectionState, ConnectionStatus, admin_key_secret};
use super::settings_store::NotificationSettingsStore;
use super::status::StatusBoard;
use crate::nodes::store::NodeStore;
use crate::secrets;

struct Running {
    address: String,
    handle: JoinHandle<()>,
}

type Tasks = HashMap<String, Running>;

#[derive(Default)]
pub struct NotificationManager {
    tasks: Mutex<Tasks>,
    board: Arc<StatusBoard>,
}

fn abort(tasks: &mut Tasks, node_id: &str) {
    if let Some(running) = tasks.remove(node_id) {
        running.handle.abort();
    }
}

impl NotificationManager {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn statuses(&self) -> Vec<ConnectionStatus> {
        self.board.all()
    }

    pub fn reconcile(&self, app: &AppHandle) -> Result<(), String> {
        let nodes = app.state::<NodeStore>().load()?;
        let settings_store = app.state::<NotificationSettingsStore>();
        let mut tasks = self.tasks.lock().map_err(|e| e.to_string())?;

        let stored: HashSet<&str> = nodes.iter().map(|node| node.id.as_str()).collect();
        let stale: Vec<String> = tasks
            .keys()
            .filter(|id| !stored.contains(id.as_str()))
            .cloned()
            .collect();
        for id in stale {
            abort(&mut tasks, &id);
            self.board.remove(&id);
        }

        for node in &nodes {
            let settings = settings_store.load(&node.id)?;
            if !settings.enabled {
                abort(&mut tasks, &node.id);
                self.board
                    .set(app, &node.id, ConnectionState::Disabled, None);
                continue;
            }

            if !secrets::exists(&admin_key_secret(&node.id))? {
                abort(&mut tasks, &node.id);
                self.board
                    .set(app, &node.id, ConnectionState::NeedsKey, None);
                continue;
            }

            let already_running = tasks
                .get(&node.id)
                .is_some_and(|running| running.address == node.address);
            if already_running {
                continue;
            }

            abort(&mut tasks, &node.id);
            let handle = spawn(connection::run(
                app.clone(),
                Arc::clone(&self.board),
                node.clone(),
            ));
            tasks.insert(
                node.id.clone(),
                Running {
                    address: node.address.clone(),
                    handle,
                },
            );
        }

        Ok(())
    }

    pub fn restart_node(&self, app: &AppHandle, node_id: &str) -> Result<(), String> {
        {
            let mut tasks = self.tasks.lock().map_err(|e| e.to_string())?;
            abort(&mut tasks, node_id);
        }
        self.reconcile(app)
    }

    pub fn stop_node(&self, node_id: &str) -> Result<(), String> {
        let mut tasks = self.tasks.lock().map_err(|e| e.to_string())?;
        abort(&mut tasks, node_id);
        self.board.remove(node_id);
        Ok(())
    }
}
