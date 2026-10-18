export type NotificationPriority = 'normal' | 'urgent';

export type PriorityFilter = 'all' | 'urgentOnly';

export type NotificationSettings = {
  enabled: boolean;
  priorityFilter: PriorityFilter;
  showContent: boolean;
};

export type NotificationConfig = {
  settings: NotificationSettings;
  adminKeySet: boolean;
};

export type ConnectionState = 'disabled' | 'needsKey' | 'connecting' | 'connected' | 'disconnected' | 'unauthorized';

export type ConnectionStatus = {
  nodeId: string;
  state: ConnectionState;
  message: string | null;
  updatedAt: number;
};
