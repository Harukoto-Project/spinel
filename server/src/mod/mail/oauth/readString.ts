export const readString = (value: unknown, key: string): string | null => {
  if (typeof value !== 'object' || value === null || !(key in value)) return null;
  const raw = (value as Record<string, unknown>)[key];
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed === '' ? null : trimmed;
};

export const nameFromEmail = (email: string): string => email.split('@')[0] || email;
