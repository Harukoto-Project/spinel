import { execute, queryRows, type Queryable } from '../../db/Database.js';

export type CompletedStepStatus = 'success' | 'skipped';

export interface CompletedStep {
  status: CompletedStepStatus;
  finishedAt: number;
}

export type CompletedSteps = Record<string, CompletedStep>;

interface StateRow {
  setup_state: string;
}

const parse = (text: string): CompletedSteps => {
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    const result: CompletedSteps = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      const step = value as Partial<CompletedStep> | null;
      if (step === null || typeof step !== 'object') continue;
      if ((step.status === 'success' || step.status === 'skipped') && typeof step.finishedAt === 'number') {
        result[id] = { status: step.status, finishedAt: step.finishedAt };
      }
    }
    return result;
  } catch {
    return {};
  }
};

export class SetupStateStore {
  public constructor(private readonly db: Queryable) {}

  public async get(pluginId: string): Promise<CompletedSteps> {
    const [row] = await queryRows<StateRow>(this.db, 'SELECT setup_state FROM plugin_app_state WHERE plugin_id = ?', [
      pluginId,
    ]);
    return row ? parse(row.setup_state) : {};
  }

  public async save(pluginId: string, steps: CompletedSteps): Promise<void> {
    await execute(
      this.db,
      `INSERT INTO plugin_app_state (plugin_id, setup_state, updated_at) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE setup_state = VALUES(setup_state), updated_at = VALUES(updated_at)`,
      [pluginId, JSON.stringify(steps), Date.now()],
    );
  }

  public async remove(pluginId: string): Promise<void> {
    await execute(this.db, 'DELETE FROM plugin_app_state WHERE plugin_id = ?', [pluginId]);
  }
}
