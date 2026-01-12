import { Client } from "cassandra-driver";
import {
  CassandraTypeMap,
  SelectColumns,
  SelectWhereOptions,
  TableSchema,
} from "../types";
import { formatCqlValue } from "../utilities/format-cql-value";

export class SelectStatement {
  constructor(
    private client: Client,
    public statement: string,
  ) {}

  async execute() {
    return this.client.execute(this.statement);
  }
}

export class SelectBuilder<Schema extends TableSchema = TableSchema> {
  private tableName?: string;
  private keyspaceName?: string;
  private columnsClause?: string;
  private whereClause?: string;

  constructor(
    private client: Client,
    private schema: Schema,
  ) {}

  columns<T extends SelectColumns<Schema["columns"], Schema> | "*">(
    firstColumn?: T,
    ...columns: T extends "*" | undefined
      ? never[]
      : SelectColumns<Schema["columns"], Schema>[]
  ) {
    if (firstColumn === "*") {
      this.columnsClause = "*";
      return this;
    }

    this.columnsClause = [firstColumn, ...columns].join(", ");

    return this;
  }

  from(tableName: string, keyspaceName?: string) {
    this.tableName = tableName;
    this.keyspaceName = keyspaceName;
    return this;
  }

  where(options: SelectWhereOptions<Schema["columns"], Schema>) {
    // If there is no primary key specified in the schema, return the builder silently
    if (this.schema?.primaryKey === undefined) return this;

    // We'll use this to make a runtime check that all partition keys are specified
    const usedPartitionKeys = options.partition.reduce(
      (previous, [partitionKey]) => ({ ...previous, [partitionKey]: true }),
      {} as Record<string, boolean>,
    );

    let partitionKeys = this.schema.primaryKey[0];

    // If the schema primary key is an empty array
    if (partitionKeys === undefined) {
      return this;
    }

    partitionKeys = Array.isArray(partitionKeys)
      ? partitionKeys
      : [partitionKeys];

    // Runtime check all partition keys are used
    for (const partitionKey of partitionKeys) {
      if (partitionKey in usedPartitionKeys === false)
        throw new Error(
          `All partition keys must be specified in the WHERE clause, partition key ${partitionKey.toString()} is not used`,
        );
    }

    // Format partition conditions properly
    const partitions = options.partition.map(([column, operator, value]) => {
      const type = this.schema.columns[column];
      if (operator === "IN") {
        const values = (
          value as unknown as Array<
            CassandraTypeMap[keyof CassandraTypeMap]["type"]
          >
        )
          .map((v) => `${formatCqlValue(v, type)}`)
          .join(", ");
        return `${column} IN (${values})`;
      }

      return `${column} ${operator} ${formatCqlValue(value, type)}`;
    });

    const clustering = (options.clustering ?? []).map((condition) =>
      condition.join(" "),
    );

    this.whereClause = `${[...partitions, ...clustering].join(" AND ")}`;

    return this;
  }

  build() {
    const parts = ["SELECT"];

    if (!this.columnsClause) parts.push("*");
    else parts.push(this.columnsClause);

    parts.push("FROM");

    if (!this.tableName) throw new Error("Table name hasn't been specified");
    else if (this.keyspaceName)
      parts.push(`${this.keyspaceName}.${this.tableName}`);
    else parts.push(this.tableName);

    if (this.whereClause) {
      parts.push("WHERE");

      parts.push(this.whereClause);
    }

    return new SelectStatement(this.client, parts.join(" ") + ";");
  }
}
