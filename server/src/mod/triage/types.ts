import type { Mail } from '../mail/types.js';

export interface TriageConfig {
  ignoreBelow: number;
  notifyAbove: number;
  jevModel: string;
  jevBodyChars: number;
  claudeModel: string;
  claudeBodyChars: number;
}

export interface TriageKeys {
  typesafe: string;
  anthropic: string;
}

export interface JevScore {
  junk: number;
  actionRequired: number;
  hasDeadline: number;
  importance: number;
  relevance: number;
}

export type Decision = 'notify' | 'ignore';

export type DecidedBy = 'jev' | 'claude';

export interface ClaudeVerdict {
  important: boolean;
  reason: string;
  summary: string;
  deadline: string | null;
}

export interface TriageResult {
  mail: Mail;
  decision: Decision;
  decidedBy: DecidedBy;
  jev: JevScore;
  claude: ClaudeVerdict | null;
}
