export const parseBearer = (header: string | undefined): string | null => {
  if (!header) return null;
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  return match?.[1] ?? null;
};
