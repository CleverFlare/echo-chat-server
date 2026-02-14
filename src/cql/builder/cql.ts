import { Client, DseClientOptions } from "cassandra-driver";
import { CreateTableBuilder } from "./create-table/builder";
import { CreateTypeBuilder } from "./create-type/builder";

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
      table: tableBuilder.table.bind(tableBuilder),
      type: typeBuilder.type.bind(typeBuilder),
    };
  }
}
