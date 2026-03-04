import { Client } from "cassandra-driver";
import { TableContext } from "@/cql/types";
import { SelectBuilder } from "../select/builder";
import { DropTableBuilder } from "../drop-table/builder";
import { InsertBuilder } from "../insert/builder";
import { wrapMethod } from "../../utils/wrap-method";
import { UpdateBuilder } from "../update/builder";
import { DeleteBuilder } from "../delete/builder";

export class CreateTableContext<const TContext extends TableContext> {
  select;
  drop;
  insert;
  update;
  delete;

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

    this.select = wrapMethod(selectBinding, selectBinding.select);

    this.drop = (): DropTableBuilder<{
      keyspace?: TContext["keyspace"] extends unknown
        ? undefined
        : TContext["keyspace"];
      table: TContext["table"];
      ifExists: true;
    }> => {
      const dropBinding = DropTableBuilder.create(client)
        .table(context.table)
        .ifExists();

      if (context.keyspace)
        // eslint-disable-next-line
        return dropBinding.keyspace(context.keyspace) as any;

      // eslint-disable-next-line
      return dropBinding as any;
    };

    const insertBinding = InsertBuilder.into(
      client,
      this as CreateTableContext<TContext>,
    );

    this.insert = wrapMethod(insertBinding, insertBinding.insert);

    const updateBinding = UpdateBuilder.from(
      client,
      this as CreateTableContext<TContext>,
    );

    this.update = () => updateBinding;

    const deleteBinding = DeleteBuilder.from(
      client,
      this as CreateTableContext<TContext>,
    );

    this.delete = () => deleteBinding;
  }

  static create<const T extends TableContext>(
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
