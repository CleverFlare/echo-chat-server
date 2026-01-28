import { Client } from "cassandra-driver";
import { snakeCase } from "change-case";

export class DropTypeStatement {
  constructor(
    private client: Client,
    public statement: string,
    private typeName: string,
    private keyspace?: string,
  ) {}

  async execute() {
    return this.client.execute(this.statement);
  }
}

export class DropTypeBuilder {
  private typeName?: string;
  private keyspace?: string;
  private ifExistsOption?: boolean = false;

  constructor(private client: Client) {}

  type(typeName: string, keyspace?: string) {
    this.typeName = snakeCase(typeName);
    this.keyspace = keyspace && snakeCase(keyspace);

    return this;
  }

  ifExists() {
    this.ifExistsOption = true;
    return this;
  }

  build(): DropTypeStatement {
    const parts = ["DROP", "TYPE"];

    if (this.ifExistsOption) parts.push("IF EXISTS");

    if (!this.typeName) throw new Error("Type name required");

    if (this.keyspace) parts.push(`${this.keyspace}.${this.typeName}`);
    else parts.push(this.typeName);

    return new DropTypeStatement(
      this.client,
      parts.join(" ") + ";",
      this.typeName,
      this.keyspace,
    );
  }
}
