export type MailProviderId = 'google';

export type MailAccount = {
  id: string;
  provider: MailProviderId;
  email: string;
  name: string;
  connectedAt: number;
  connected: boolean;
};

export type MailProviderDefinition = {
  id: MailProviderId;
  label: string;
  description: string;
};
