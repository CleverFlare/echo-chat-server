import * as changeCase from "change-case";

import {
  CassandraResultType,
  CollectionTypeDefinition,
  ColumnDefinitions,
} from "../types";
import { Client } from "cassandra-driver";
import { DropTypeBuilder } from "./drop-type";
import { toCQLType } from "../utilities/to-cql-type";
import { udtFromSchema } from "../utilities/udt-from-schema";

export class CreateTypeStatement<C extends ColumnDefinitions> {
  constructor(
    private client: Client,
    public statement: string,
    private typeName: string,
    private schema: C,
  ) {}

  drop() {
    return new DropTypeBuilder(this.client).type(this.typeName);
  }

  reference() {
    console.log("TYPE SCHEMA", this.schema);
    return udtFromSchema(this.typeName, this.schema);
  }

  async execute() {
    return this.client.execute(this.statement) as Promise<
      CassandraResultType<undefined>
    >;
  }
}

export class CreateTypeBuilder<C extends ColumnDefinitions> {
  private typeName?: string;
  private keyspace?: string;
  private ifNotExistsClause = false;
  private columns?: string;
  private schema!: C;

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

  definitions<const C extends ColumnDefinitions>(
    schema: C,
  ): CreateTypeBuilder<C> {
    this.schema = schema as unknown as typeof this.schema;

    const entries = Object.entries(schema);

    const columns = entries
      .map(([columnName, columnType]) => {
        if ((columnType as CollectionTypeDefinition)?._meta)
          return `${changeCase.snakeCase(columnName)} ${toCQLType(columnType)}`;

        return `${changeCase.snakeCase(columnName)} ${columnType}`;
      })
      .join(", ");

    this.columns = `(${columns})`;

    return this as unknown as CreateTypeBuilder<C>;
  }

  build(): CreateTypeStatement<C> {
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

    return new CreateTypeStatement<C>(
      this.client,
      parts.join(" ") + ";",
      this.typeName,
      this.schema,
    );
  }
}
