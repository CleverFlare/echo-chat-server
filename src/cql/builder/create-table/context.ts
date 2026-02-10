import { Client } from "cassandra-driver";
import { TableContext } from "@/cql/types";
import { SelectBuilder } from "../select/builder";

export class CreateTableContext<TContext extends TableContext> {
  readonly context: TContext;
  select;

  protected constructor(
    private client: Client,
    private statement: string,
    context: TContext,
  ) {
    this.context = context;

    const selectBinding = SelectBuilder.from(
      this.client,
      this as CreateTableContext<TContext>,
    );

    this.select = selectBinding.select.bind(selectBinding);
  }

  static create<T extends TableContext>(
    client: Client,
    statement: string,
    context: T,
  ): CreateTableContext<T> {
    return new CreateTableContext(client, statement, context);
  }

  toCQL() {
    return this.statement;
  }

  async execute(): Promise<void> {
    await this.client.execute(this.statement);
  }
}
