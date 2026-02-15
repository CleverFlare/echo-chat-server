import { Client } from "cassandra-driver";
import { InsertBuilderInput } from "./types";
import { TableContext } from "@/cql/types";

export class InsertContext<
  TInsertContext extends InsertBuilderInput,
  TTableContext extends TableContext,
> {
  readonly context: {
    insert: TInsertContext;
    table: TTableContext;
  };

  protected constructor(
    private client: Client,
    private statement: string,
    private values: unknown[],
    context: {
      insert: TInsertContext;
      table: TTableContext;
    },
  ) {
    this.context = context;
  }

  static create<
    TInsert extends InsertBuilderInput,
    TTable extends TableContext,
  >(
    client: Client,
    statement: string,
    values: unknown[],
    context: {
      insert: TInsert;
      table: TTable;
    },
  ): InsertContext<TInsert, TTable> {
    return new InsertContext(client, statement, values, context);
  }

  toCQL() {
    return this.statement;
  }

  async execute(): Promise<void> {
    await this.client.execute(this.statement, this.values, { prepare: true });
  }
}
