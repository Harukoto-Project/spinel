import type { ApiKeyDefinition } from '@/types/apiKey';

export const API_KEYS: ApiKeyDefinition[] = [
  {
    id: 'typesafe',
    label: 'TypeSafe APIキー',
    description: 'Jevによるメールのスコア付けに使用します。',
    placeholder: 'TypeSafeのAPI キーを入力',
  },
  {
    id: 'anthropic',
    label: 'Anthropic APIキー',
    description: '高度な分析や会話のために使用します。',
    placeholder: 'sk-ant-...',
  },
];
