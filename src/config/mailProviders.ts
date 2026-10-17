import type { MailProviderDefinition, MailProviderId } from '@/types/mailAccount';

export const MAIL_PROVIDERS: MailProviderDefinition[] = [
  {
    id: 'google',
    label: 'Google',
    description: 'Gmail アカウントに Google でログインして追加します。',
  },
];

export function getMailProviderLabel(id: MailProviderId): string {
  return MAIL_PROVIDERS.find((provider) => provider.id === id)?.label ?? id;
}
