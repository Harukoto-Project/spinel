export type NodeStatus = 'online' | 'offline' | 'error';

export type NodeOsInfo = {
  name: string;
  platform: string;
  release: string;
  arch: string;
};

export type NodeHealth = {
  status: 'ok';
  version: string;
  os: NodeOsInfo;
  startedAt: string;
  updatedAt: string;
};

export type StoredNode = {
  id: string;
  name: string;
  address: string;
  lastSeenAt: string | null;
};

export type NodeLiveState = {
  status: NodeStatus;
  health: NodeHealth | null;
  pingMs: number | null;
};

export type NodeInfo = StoredNode & NodeLiveState;

export type NewNodeInput = {
  name: string;
  address: string;
  adminKey?: string;
};
