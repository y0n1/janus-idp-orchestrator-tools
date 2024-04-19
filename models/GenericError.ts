interface GenericErrorOptions<C> {
  cause?: C;
}

export class GenericError<Cause> extends Error {
  readonly cause?: Cause;

  constructor(message?: string, options?: GenericErrorOptions<Cause>) {
    super(message, options);
    this.cause = options?.cause;
  }
}
