// @/utils/errors.ts
export type AppErrorKind = "client" | "server";

export class AppError<
  Kind extends AppErrorKind = "server" | "client",
> extends Error {
  constructor(
    message: string,
    public readonly kind: Kind,
    public readonly code?: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }

  static client(message: string, code?: string) {
    return new AppError(message, "client", code);
  }

  static server(message: string, code?: string) {
    return new AppError(message, "server", code);
  }

  static from(err: unknown) {
    if (err instanceof AppError) return err;

    const message = err instanceof Error ? err.message : String(err);
    return new AppError(message, "server", "Internal server error", err);
  }
}
