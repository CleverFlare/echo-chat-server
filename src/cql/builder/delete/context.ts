import { Client } from "cassandra-driver";
import { DeleteBuilderInput } from "./types";
import { TableContext } from "@/cql/types";

export class DeleteContext<
  TDeleteContext extends DeleteBuilderInput,
  TTableContext extends TableContext,
> {
  readonly context: {
    delete: TDeleteContext;
    table: TTableContext;
  };

  protected constructor(
    private client: Client,
    private statement: string,
    private values: unknown[],
    context: {
      delete: TDeleteContext;
      table: TTableContext;
    },
  ) {
    this.context = context;
  }

  static create<
    TDelete extends DeleteBuilderInput,
    TTable extends TableContext,
  >(
    client: Client,
    statement: string,
    values: unknown[],
    context: {
      delete: TDelete;
      table: TTable;
    },
  ): DeleteContext<TDelete, TTable> {
    return new DeleteContext(client, statement, values, context);
  }

  toCQL() {
    return this.statement;
  }

  async execute(): Promise<void> {
    await this.client.execute(this.statement, this.values, { prepare: true });
  }
}
