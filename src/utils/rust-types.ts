// ============================================================
// OPTION<T>
// ============================================================

export type OptionVariant<T> =
  | { readonly _tag: "Some"; readonly value: T }
  | { readonly _tag: "None" };

export class Option<T> {
  private constructor(private readonly inner: OptionVariant<T>) {}

  static Some<T>(value: T): Option<T> {
    return new Option({ _tag: "Some", value });
  }

  static None<T = never>(): Option<T> {
    return new Option<T>({ _tag: "None" });
  }

  isSome(): boolean {
    return this.inner._tag === "Some";
  }
  isNone(): boolean {
    return this.inner._tag === "None";
  }

  unwrap(): T {
    if (this.inner._tag === "Some") return this.inner.value;
    throw new Error("called `Option.unwrap()` on a `None` value");
  }

  unwrapOr(defaultValue: T): T {
    return this.inner._tag === "Some" ? this.inner.value : defaultValue;
  }

  unwrapOrElse(fn: () => T): T {
    return this.inner._tag === "Some" ? this.inner.value : fn();
  }

  map<U>(fn: (value: T) => U): Option<U> {
    if (this.inner._tag === "Some") return Option.Some(fn(this.inner.value));
    return Option.None<U>();
  }

  andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    if (this.inner._tag === "Some") return fn(this.inner.value);
    return Option.None<U>();
  }

  or(other: Option<T>): Option<T> {
    return this.inner._tag === "Some" ? this : other;
  }

  filter(predicate: (value: T) => boolean): Option<T> {
    if (this.inner._tag === "Some" && predicate(this.inner.value)) return this;
    return Option.None<T>();
  }

  okOr<E>(err: E): Result<T, E> {
    if (this.inner._tag === "Some") return Result.Ok(this.inner.value);
    return Result.Err(err);
  }

  match<U>(arms: { Some: (value: T) => U; None: () => U }): U {
    if (this.inner._tag === "Some") return arms.Some(this.inner.value);
    return arms.None();
  }

  toString(): string {
    if (this.inner._tag === "Some")
      return `Some(${JSON.stringify(this.inner.value)})`;
    return "None";
  }
}

// ============================================================
// RESULT<T, E>
// ============================================================

export type ResultVariant<T, E> =
  | { readonly _tag: "Ok"; readonly value: T }
  | { readonly _tag: "Err"; readonly error: E };

export class Result<T, E> {
  private constructor(private readonly inner: ResultVariant<T, E>) {}

  static Ok<T, E = never>(value: T): Result<T, E> {
    return new Result<T, E>({ _tag: "Ok", value });
  }

  static Err<E, T = never>(error: E): Result<T, E> {
    return new Result<T, E>({ _tag: "Err", error });
  }

  isOk(): boolean {
    return this.inner._tag === "Ok";
  }
  isErr(): boolean {
    return this.inner._tag === "Err";
  }

  unwrap(): T {
    if (this.inner._tag === "Ok") return this.inner.value;
    throw new Error(
      // eslint-disable-next-line
      `called \`Result.unwrap()\` on an \`Err\` value: ${JSON.stringify((this.inner as any).error)}`,
    );
  }

  unwrapErr(): E {
    if (this.inner._tag === "Err") return this.inner.error;
    throw new Error("called `Result.unwrapErr()` on an `Ok` value");
  }

  unwrapOr(defaultValue: T): T {
    return this.inner._tag === "Ok" ? this.inner.value : defaultValue;
  }

  unwrapOrElse(fn: (error: E) => T): T {
    return this.inner._tag === "Ok" ? this.inner.value : fn(this.inner.error);
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.inner._tag === "Ok") return Result.Ok(fn(this.inner.value));
    return Result.Err<E, U>(this.inner.error);
  }

  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    if (this.inner._tag === "Err") return Result.Err(fn(this.inner.error));
    return Result.Ok<T, F>(this.inner.value);
  }

  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.inner._tag === "Ok") return fn(this.inner.value);
    return Result.Err<E, U>(this.inner.error);
  }

  async andThenAsync<U>(
    fn: (value: T) => Promise<Result<U, E>>,
  ): Promise<Result<U, E>> {
    if (this.inner._tag === "Ok") return fn(this.inner.value);
    return Result.Err<E, U>(this.inner.error);
  }

  or(other: Result<T, E>): Result<T, E> {
    return this.inner._tag === "Ok" ? this : other;
  }

  ok(): Option<T> {
    if (this.inner._tag === "Ok") return Option.Some(this.inner.value);
    return Option.None<T>();
  }

  err(): Option<E> {
    if (this.inner._tag === "Err") return Option.Some(this.inner.error);
    return Option.None<E>();
  }

  match<U>(arms: { Ok: (value: T) => U; Err: (error: E) => U }): U {
    if (this.inner._tag === "Ok") return arms.Ok(this.inner.value);
    return arms.Err(this.inner.error);
  }

  toString(): string {
    if (this.inner._tag === "Ok")
      return `Ok(${JSON.stringify(this.inner.value)})`;
    return `Err(${JSON.stringify(this.inner.error)})`;
  }
}
