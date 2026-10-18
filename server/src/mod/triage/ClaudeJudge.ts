import Anthropic from '@anthropic-ai/sdk';
import type { Mail } from '../mail/types.js';
import type { ClaudeVerdict, JevScore } from './types.js';

const SYSTEM_PROMPT = [
  'あなたは個人のメール振り分けアシスタントです。',
  '受信したメールが、受信者本人に通知して知らせる価値があるかを判定します。',
  '通知すべきもの: 個人宛ての連絡、仕事の依頼、支払い・手続きの期限、予定や締め切りに関わる連絡、セキュリティ上の重要な警告。',
  '通知不要なもの: マーケティング、広告、メルマガ、キャンペーン、カード利用通知、定型的なサービス通知、SNSの通知。',
  '事前スコアは0から1で、junkは自動送信・一斉送信らしさ、relevanceは総合的な重要度の目安です。参考にしつつ、本文を見て自分で判断してください。',
  '必ず judge ツールで回答してください。',
].join('\n');

const JUDGE_TOOL: Anthropic.Tool = {
  name: 'judge',
  description: 'メールを通知すべきかどうか判定する',
  input_schema: {
    type: 'object',
    properties: {
      important: {
        type: 'boolean',
        description: '受信者に通知すべきなら true',
      },
      reason: {
        type: 'string',
        description: '判定理由を一文で',
      },
      summary: {
        type: 'string',
        description: '通知に使う、メール内容の要約(50文字以内)',
      },
      deadline: {
        type: ['string', 'null'],
        description: '本文から読み取れる期限。なければ null',
      },
    },
    required: ['important', 'reason', 'summary', 'deadline'],
  },
};

const isVerdict = (value: unknown): value is ClaudeVerdict => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.important === 'boolean' &&
    typeof v.reason === 'string' &&
    typeof v.summary === 'string' &&
    (typeof v.deadline === 'string' || v.deadline === null)
  );
};

export class ClaudeJudge {
  private readonly client: Anthropic;

  public constructor(
    private readonly model: string,
    private readonly bodyChars: number,
    apiKey: string,
  ) {
    this.client = new Anthropic({ apiKey });
  }

  public async judge(mail: Mail, jev: JevScore): Promise<ClaudeVerdict> {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      tools: [JUDGE_TOOL],
      tool_choice: { type: 'tool', name: JUDGE_TOOL.name },
      messages: [
        {
          role: 'user',
          content: [
            `事前スコア: junk=${jev.junk.toFixed(2)} relevance=${jev.relevance.toFixed(2)}`,
            `差出人: ${mail.from}`,
            `件名: ${mail.subject}`,
            `受信日時: ${mail.receivedAt.toISOString()}`,
            '本文:',
            mail.body.slice(0, this.bodyChars),
          ].join('\n'),
        },
      ],
    });

    for (const block of message.content) {
      if (block.type === 'tool_use' && isVerdict(block.input)) {
        return block.input;
      }
    }
    throw new Error('Claude から判定結果を取得できませんでした');
  }
}
