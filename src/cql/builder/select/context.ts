import { Client } from "cassandra-driver";
import { SelectInput, SelectResult } from "./types";
import { TableContext } from "@/cql/types";

export class SelectContext<
  const TSContext extends SelectInput,
  const TTContext extends TableContext,
> {
  protected constructor(
    private client: Client,
    private statement: string,
    public readonly context: { select: TSContext; table: TTContext },
  ) {}

  static create<
    const SContext extends SelectInput,
    const TConext extends TableContext,
  >(
    client: Client,
    statement: string,
    context: { select: SContext; table: TConext },
  ) {
    return new SelectContext<SContext, TConext>(client, statement, context);
  }

  getCQL() {
    return this.statement;
  }

  async execute() {
    const result = await this.client.execute(this.statement);

    return result.rows as unknown as SelectResult<
      TTContext,
      TSContext["columns"]
    >;
  }
}
