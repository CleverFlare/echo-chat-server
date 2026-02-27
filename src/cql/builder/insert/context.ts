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
    context: {
      insert: TInsert;
      table: TTable;
    },
  ): InsertContext<TInsert, TTable> {
    return new InsertContext(client, statement, context);
  }

  toCQL() {
    return this.statement;
  }

  getValues() {
    return this.context.insert.values;
  }

  async execute(): Promise<void> {
    await this.client.execute(this.statement, this.context.insert.values, {
      prepare: true,
    });
  }
}
