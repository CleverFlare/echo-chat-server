// @/utils/errors.ts
export type AppErrorKind = "client" | "server";

export class AppError<
  Kind extends AppErrorKind = "server" | "client",
> extends Error {
  constructor(
    message: string,
    public readonly kind: Kind,
    public readonly code?: string,
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
}
