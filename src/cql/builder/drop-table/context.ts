import { Client } from "cassandra-driver";
import { DropTableBuilderInput } from "./types";

export class DropTableContext<TContext extends DropTableBuilderInput> {
  readonly #context: TContext;

  protected constructor(
    private client: Client,
    private statement: string,
    context: TContext,
  ) {
    this.#context = context;
  }

  static create<T extends DropTableBuilderInput>(
    client: Client,
    statement: string,
    context: T,
  ): DropTableContext<T> {
    return new DropTableContext(client, statement, context);
  }

  toCQL() {
    return this.statement;
  }

  async execute(): Promise<void> {
    await this.client.execute(this.statement);
  }
}
