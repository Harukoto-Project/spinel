import { HttpError } from '../http/HttpError.js';

export class MailError extends HttpError {
  public constructor(status: number, code: string, message: string) {
    super(status, code, message);
    this.name = 'MailError';
  }
}

export class ProviderAuthError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ProviderAuthError';
  }
}

export class HttpStatusError extends Error {
  public constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpStatusError';
  }
}
