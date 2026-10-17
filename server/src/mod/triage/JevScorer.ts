import { TypeSafeClient, noul, score } from '@typesafe-ai/sdk';
import type { Mail } from '../mail/types.js';
import type { JevScore } from './types.js';

const IMPORTANCE_LEVELS = [
  '受信者にとって無関係。広告、メルマガ、プロモーション、自動送信の通知、利用明細など',
  '参考情報。読んでも読まなくてもよく、対応は不要',
  '対応が必要だが、期限や緊急性は低い',
  '対応が必要で、期限が近いか、放置すると不利益が生じる',
] as const;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export class JevScorer {
  private readonly client: TypeSafeClient;

  public constructor(
    model: string,
    private readonly bodyChars: number,
  ) {
    this.client = new TypeSafeClient({ defaultModel: model });
  }

  public async score(mail: Mail): Promise<JevScore> {
    const { answers } = await this.client.systemOne({
      state: {
        from: mail.from,
        subject: mail.subject,
        body: mail.body.slice(0, this.bodyChars),
      },
      questions: {
        junk: noul(
          'このメールは、マーケティング、広告、メルマガ、キャンペーン案内、カードや各種サービスの利用通知、ログイン通知など、受信者が個別に対応する必要のない自動送信・一斉送信のメールである',
        ),
        actionRequired: noul(
          'このメールは、受信者本人が何らかの行動(返信、支払い、手続き、確認、承認、予定調整など)を取ることを求めている',
        ),
        hasDeadline: noul('このメールには、受信者が対応すべき期限、締め切り、日時の指定が含まれている'),
        importance: score('このメールが受信者にとってどれだけ重要か', IMPORTANCE_LEVELS),
      },
    });

    const junk = clamp01(answers.junk.noul);
    const actionRequired = clamp01(answers.actionRequired.noul);
    const hasDeadline = clamp01(answers.hasDeadline.noul);
    const importance = clamp01(answers.importance.score / (IMPORTANCE_LEVELS.length - 1));
    const relevance = clamp01((1 - junk) * (0.5 * importance + 0.5 * Math.max(actionRequired, hasDeadline)));

    return { junk, actionRequired, hasDeadline, importance, relevance };
  }
}
