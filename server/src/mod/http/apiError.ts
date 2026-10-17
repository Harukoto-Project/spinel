export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export const apiError = (code: string, message: string): ApiErrorBody => ({
  error: { code, message },
});
