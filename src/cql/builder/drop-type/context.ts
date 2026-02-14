import { Client } from "cassandra-driver";
import { DropTypeBuilderInput } from "./types";

export class DropTypeContext<TContext extends DropTypeBuilderInput> {
  readonly #context: TContext;

  protected constructor(
    private client: Client,
    private statement: string,
    context: TContext,
  ) {
    this.#context = context;
  }

  static create<T extends DropTypeBuilderInput>(
    client: Client,
    statement: string,
    context: T,
  ): DropTypeContext<T> {
    return new DropTypeContext(client, statement, context);
  }

  toCQL() {
    return this.statement;
  }

  async execute(): Promise<void> {
    await this.client.execute(this.statement);
  }
}
