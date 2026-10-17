export type MailProviderId = 'google' | 'outlook';

export type MailAccount = {
  id: string;
  provider: MailProviderId;
  email: string;
  name: string;
  connectedAt: number;
  connected: boolean;
  lastError: string | null;
  lastCheckedAt: number | null;
};

export type MailProviderDefinition = {
  id: MailProviderId;
  label: string;
  description: string;
};

export type MailSettings = {
  pollIntervalSec: number;
};

export type MailSettingField = {
  key: keyof MailSettings;
  label: string;
  description: string;
  unit: string;
  min: number;
  max: number;
  defaultValue: number;
};
