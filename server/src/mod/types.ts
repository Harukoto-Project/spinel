export interface OsInfo {
  name: string;
  platform: string;
  release: string;
  arch: string;
}

export interface HealthResponse {
  status: 'ok';
  version: string;
  os: OsInfo;
  startedAt: string;
  updatedAt: string;
}
