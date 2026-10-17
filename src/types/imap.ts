export type ImapAccount = {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
  secure: boolean;
  passwordSet: boolean;
};

export type ImapAccountInput = {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
  secure: boolean;
  password?: string;
};

export type ImapSettings = {
  lookbackDays: number;
  fetchLimit: number;
  pollIntervalSec: number;
};

export type ImapConfig = {
  accounts: ImapAccount[];
  settings: ImapSettings;
};

export type ImapSettingField = {
  key: keyof ImapSettings;
  label: string;
  description: string;
  unit: string;
  min: number;
  max: number;
};
