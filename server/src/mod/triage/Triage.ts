import type { Mail } from '../mail/types.js';
import { ClaudeJudge } from './ClaudeJudge.js';
import { JevScorer } from './JevScorer.js';
import type { TriageConfig, TriageResult } from './types.js';

export class Triage {
  private readonly jev: JevScorer;
  private readonly claude: ClaudeJudge;
  private readonly ignoreBelow: number;
  private readonly notifyAbove: number;

  public constructor(config: TriageConfig) {
    this.jev = new JevScorer(config.jevModel, config.jevBodyChars);
    this.claude = new ClaudeJudge(config.claudeModel, config.claudeBodyChars);
    this.ignoreBelow = config.ignoreBelow;
    this.notifyAbove = config.notifyAbove;
  }

  public async run(mail: Mail): Promise<TriageResult> {
    const jev = await this.jev.score(mail);

    if (jev.relevance < this.ignoreBelow) {
      return { mail, decision: 'ignore', decidedBy: 'jev', jev, claude: null };
    }
    if (jev.relevance > this.notifyAbove) {
      return { mail, decision: 'notify', decidedBy: 'jev', jev, claude: null };
    }

    const claude = await this.claude.judge(mail, jev);
    return {
      mail,
      decision: claude.important ? 'notify' : 'ignore',
      decidedBy: 'claude',
      jev,
      claude,
    };
  }
}
