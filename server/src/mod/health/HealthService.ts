import os from 'node:os';
import { getOsName } from '../system/osName.js';
import type { HealthResponse, OsInfo } from '../types.js';

export class HealthService {
  private readonly startedAt = new Date();
  private readonly os: OsInfo = {
    name: getOsName(),
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
  };

  public constructor(private readonly version: string) {}

  public report(): HealthResponse {
    return {
      status: 'ok',
      version: this.version,
      os: this.os,
      startedAt: this.startedAt.toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
