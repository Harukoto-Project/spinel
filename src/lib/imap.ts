export function defaultImapHost(user: string): string {
  const domain = user.split('@')[1]?.trim().toLowerCase();
  return domain === 'gmail.com' || domain === 'googlemail.com' ? 'imap.gmail.com' : '';
}

export function defaultAccountName(user: string): string {
  return user.split('@')[0]?.trim() ?? '';
}
