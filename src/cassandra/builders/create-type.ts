import * as changeCase from "change-case";

import { ColumnDefinitions } from "../types";
import { Client } from "cassandra-driver";

export class CreateTypeStatement {
  constructor(
    private client: Client,
    public statement: string,
  ) {}

  async execute() {
    return this.client.execute(this.statement);
  }
}

export class CreateTypeBuilder {
  private typeName?: string;
  private keyspace?: string;
  private ifNotExistsClause = false;
  private columns?: string;

  constructor(private client: Client) {}

  type(typeName: string, keyspace?: string) {
    this.typeName = typeName;
    this.keyspace = keyspace;

    return this;
  }

  ifNotExists() {
    this.ifNotExistsClause = true;

    return this;
  }

  definitions<const C extends ColumnDefinitions>(schema: C): CreateTypeBuilder {
    const entries = Object.entries(schema);

    const columns = entries
      .map(
        ([columnName, columnType]) =>
          `${changeCase.snakeCase(columnName)} ${columnType}`,
      )
      .join(", ");

    this.columns = `(${columns})`;

    return this;
  }

  build(): CreateTypeStatement {
    const parts: string[] = ["CREATE", "TYPE"];

    if (this.ifNotExistsClause) parts.push("IF NOT EXISTS");

    if (!this.typeName) throw new Error("Table name required");

    if (!this.keyspace) parts.push(this.typeName);
    else
      parts.push(
        `${changeCase.snakeCase(this.keyspace)}.${changeCase.snakeCase(this.typeName)}`,
      );

    if (!this.columns) throw new Error("Column definitions required");

    parts.push(this.columns);

    return new CreateTypeStatement(this.client, parts.join(" ") + ";");
  }
}
