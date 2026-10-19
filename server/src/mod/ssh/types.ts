export interface SshKeyInfo {
  publicKey: string;
  fingerprint: string;
  createdAt: number;
}

export interface SshCommandProvider {
  gitSshCommand(): Promise<string>;
}
