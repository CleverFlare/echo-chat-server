import { Client } from "cassandra-driver";
import { UpdateBuilderInput } from "./types";
import { TableContext } from "@/cql/types";

export class UpdateContext<
  TUpdateContext extends UpdateBuilderInput,
  TTableContext extends TableContext,
> {
  readonly context: {
    update: TUpdateContext;
    table: TTableContext;
  };

  protected constructor(
    private client: Client,
    private statement: string,
    private values: unknown[],
    context: {
      update: TUpdateContext;
      table: TTableContext;
    },
  ) {
    this.context = context;
  }

  static create<
    TUpdate extends UpdateBuilderInput,
    TTable extends TableContext,
  >(
    client: Client,
    statement: string,
    values: unknown[],
    context: {
      update: TUpdate;
      table: TTable;
    },
  ): UpdateContext<TUpdate, TTable> {
    return new UpdateContext(client, statement, values, context);
  }

  toCQL() {
    return this.statement;
  }

  async execute(): Promise<void> {
    await this.client.execute(this.statement, this.values, { prepare: true });
  }
}
