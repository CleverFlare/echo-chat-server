import { Client, DseClientOptions } from "cassandra-driver";
import { CreateTableBuilder } from "./create-table/builder";

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
    const tableBuilder = CreateTableBuilder.create();
    return {
      table: tableBuilder.table.bind(tableBuilder),
    };
  }
}
