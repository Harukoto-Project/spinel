export class MailError extends Error {
  public constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
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
