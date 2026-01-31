import { Client } from "cassandra-driver";
import { CreateTableBuilderGeneric } from "./types";

export class CreateTableContext<TState extends CreateTableBuilderGeneric> {
  #context: TState;

  protected constructor(
    private statement: string,
    context: TState,
  ) {
    this.#context = context;
  }

  static create<TContext extends CreateTableBuilderGeneric>(
    statement: string,
    context: TContext,
  ): CreateTableContext<TContext> {
    return new CreateTableContext<TContext>(statement, context);
  }

  toCQL() {
    return this.statement;
  }

  async execute(client: Client): Promise<void> {
    await client.execute(this.statement);
  }
}
