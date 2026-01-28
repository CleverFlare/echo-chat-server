import { Client } from "cassandra-driver";
import { snakeCase } from "change-case";

export class DropTableStatement {
  constructor(
    private client: Client,
    public statement: string,
    private tableName: string,
    private keyspace?: string,
  ) {}

  async execute() {
    return this.client.execute(this.statement);
  }
}

export class DropTableBuilder {
  private tableName?: string;
  private keyspace?: string;
  private ifExistsOption?: boolean = false;

  constructor(private client: Client) {}

  table(tableName: string, keyspace?: string) {
    this.tableName = snakeCase(tableName);
    this.keyspace = keyspace && snakeCase(keyspace);

    return this;
  }

  ifExists() {
    this.ifExistsOption = true;
    return this;
  }

  build(): DropTableStatement {
    const parts = ["DROP", "TABLE"];

    if (this.ifExistsOption) parts.push("IF EXISTS");

    if (!this.tableName) throw new Error("Table name required");

    if (this.keyspace) parts.push(`${this.keyspace}.${this.tableName}`);
    else parts.push(this.tableName);

    return new DropTableStatement(
      this.client,
      parts.join(" ") + ";",
      this.tableName,
      this.keyspace,
    );
  }
}
