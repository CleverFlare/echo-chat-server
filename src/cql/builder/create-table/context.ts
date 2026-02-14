import { Client } from "cassandra-driver";
import { TableContext } from "@/cql/types";
import { SelectBuilder } from "../select/builder";
import { DropTableBuilder } from "../drop-table/builder";

export class CreateTableContext<TContext extends TableContext> {
  select;
  drop;

  protected constructor(
    private client: Client,
    private statement: string,
    public readonly context: TContext,
  ) {
    this.context = context;

    const selectBinding = SelectBuilder.from(
      client,
      this as CreateTableContext<TContext>,
    );

    this.select = selectBinding.select.bind(selectBinding);

    const dropBinding = DropTableBuilder.create(client)
      .table(context.table)
      .ifExists();

    if (context.keyspace) dropBinding.keyspace(context.keyspace);

    this.drop = () =>
      dropBinding as DropTableBuilder<{
        keyspace: TContext["keyspace"];
        table: TContext["table"];
        ifExists: true;
      }>;
  }

  getContext() {
    return this.context;
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
