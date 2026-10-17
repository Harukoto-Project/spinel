export type NotificationPriority = 'normal' | 'urgent';

export type NotificationKind = 'mail' | 'test';

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

export type MailDetail = {
  account: string;
  from: string;
  subject: string;
  receivedAt: string;
  summary: string;
  deadline: string | null;
};

export type ReceivedNotification = {
  id: string;
  nodeId: string;
  sentAt: string;
  receivedAt: number;
  shown: boolean;
  kind: NotificationKind;
  priority: NotificationPriority;
  title: string;
  body: string;
  mail: MailDetail | null;
};
