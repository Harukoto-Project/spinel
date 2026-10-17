const DETAIL_MAX = 300;

export const extractErrorDetail = (body: string): string => {
  try {
    const parsed: unknown = JSON.parse(body);
    if (typeof parsed === 'object' && parsed !== null && 'error' in parsed) {
      const error = parsed.error;
      if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
        return error.message.slice(0, DETAIL_MAX);
      }
    }
  } catch {
    return body.slice(0, DETAIL_MAX);
  }
  return body.slice(0, DETAIL_MAX);
};
