import { Client } from "cassandra-driver";
import { InsertValues, TableSchema } from "../types";
import { formatCqlValue } from "../utilities/format-cql-value";
import { snakeCase } from "change-case";

export class InsertStatement {
  constructor(
    private client: Client,
    public statement: string,
  ) {}

  async execute() {
    return this.client.execute(this.statement);
  }
}

export class InsertBuilder<Schema extends TableSchema = TableSchema> {
  private ifNotExistsClause = false;
  private tableName?: string;
  private keyspace?: string;
  private columnsValues?: string;

  constructor(
    private client: Client,
    private schema: Schema,
  ) {}

  into(tableName: string, keyspace?: string) {
    this.tableName = tableName;
    this.keyspace = keyspace;

    return this;
  }

  ifNotExists() {
    this.ifNotExistsClause = true;

    return this;
  }

  values(values: InsertValues<Schema["columns"], Schema>) {
    const columns = Object.keys(values);
    const columnValues = Object.values(values).map((value, index) => {
      const column = columns[index];

      const type = this.schema.columns[column];

      return formatCqlValue(value, type);
    });

    this.columnsValues = `(${columns.map((column) => snakeCase(column)).join(", ")}) VALUES (${columnValues.join(", ")})`;

    return this;
  }

  build() {
    const parts = ["INSERT", "INTO"];

    if (!this.tableName) throw new Error("Insert must take a table name");

    if (!this.keyspace) parts.push(this.tableName);
    else parts.push(`${this.keyspace}.${this.tableName}`);

    if (!this.columnsValues) throw new Error("Insert must take values");

    parts.push(this.columnsValues);

    if (this.ifNotExistsClause) parts.push("IF NOT EXISTS");

    return new InsertStatement(this.client, parts.join(" ") + ";");
  }
}
