import * as changeCase from "change-case";

import { CassandraResultType, ColumnDefinitions } from "../types";
import { Client } from "cassandra-driver";
import { DropTypeBuilder } from "./drop-type";

export class CreateTypeStatement {
  constructor(
    private client: Client,
    public statement: string,
    private typeName: string,
  ) {}

  drop() {
    return new DropTypeBuilder(this.client).type(this.typeName);
  }

  async execute() {
    return this.client.execute(this.statement) as Promise<
      CassandraResultType<undefined>
    >;
  }
}

export class CreateTypeBuilder {
  private typeName?: string;
  private keyspace?: string;
  private ifNotExistsClause = false;
  private columns?: string;

  constructor(private client: Client) {}

  type(typeName: string, keyspace?: string) {
    this.typeName = changeCase.snakeCase(typeName);
    this.keyspace = keyspace && changeCase.snakeCase(keyspace);

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

    if (!this.typeName) throw new Error("Type name required");

    if (!this.keyspace) parts.push(this.typeName);
    else
      parts.push(
        `${changeCase.snakeCase(this.keyspace)}.${changeCase.snakeCase(this.typeName)}`,
      );

    if (!this.columns) throw new Error("Column definitions required");

    parts.push(this.columns);

    return new CreateTypeStatement(
      this.client,
      parts.join(" ") + ";",
      this.typeName,
    );
  }
}
