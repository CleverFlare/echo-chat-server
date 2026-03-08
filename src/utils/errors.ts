// @/utils/errors.ts
export type AppErrorKind = "client" | "server";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly kind: AppErrorKind,
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
