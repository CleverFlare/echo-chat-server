import { Client, DseClientOptions } from "cassandra-driver";
import { CreateTableBuilder } from "./create-table/builder";
import { CreateTypeBuilder } from "./create-type/builder";
import { InsertBuilder } from "./insert/builder";
import { SelectBuilder } from "./select/builder";
import { CreateTableContext } from "./create-table/context";
import { TableContext } from "../types";
import { wrapMethod } from "../utils/wrap-method";

export class CQL {
  public client: Client;

  constructor(options: DseClientOptions) {
    this.client = new Client({
      ...options,
    });
  }

  async connect() {
    await this.client.connect();

    return this;
  }

  async shutdown() {
    await this.client.shutdown();
  }

  create() {
    const tableBuilder = CreateTableBuilder.create(this.client);
    const typeBuilder = CreateTypeBuilder.create(this.client);
    return {
      table: wrapMethod(tableBuilder, tableBuilder.table),

      type: wrapMethod(typeBuilder, typeBuilder.type),
    };
  }

  into<T extends CreateTableContext<TableContext>>(table: T) {
    return InsertBuilder.into<T>(this.client, table);
  }

  from<T extends CreateTableContext<TableContext>>(table: T) {
    return SelectBuilder.from<T>(this.client, table);
  }
}
