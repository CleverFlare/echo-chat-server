import { Client } from "cassandra-driver";
import {
  CassandraResultType,
  CassandraTypeMap,
  ColumnDefinitions,
  SchemaToType,
  SelectWhereOptions,
  TableSchema,
} from "../types";
import { formatCqlValue } from "../utilities/format-cql-value";
import { snakeCase } from "change-case";

export class SelectStatement<Row> {
  constructor(
    private client: Client,
    public statement: string,
  ) {}

  async execute() {
    return this.client.execute(this.statement) as Promise<
      CassandraResultType<Row>
    >;
  }
}

export class SelectBuilder<
  Schema extends TableSchema = TableSchema,
  SelectedColumns extends ColumnDefinitions = ColumnDefinitions,
> {
  private tableName?: string;
  private keyspaceName?: string;
  private columnsClause?: string;
  private whereClause?: string;

  constructor(
    private client: Client,
    private schema: Schema,
  ) {}

  columns<
    T extends keyof Schema["columns"] | "*",
    Rest extends readonly (keyof Schema["columns"])[],
  >(
    firstColumn?: T,
    ...columns: T extends "*" | undefined ? never[] : Rest
  ): SelectBuilder<
    Schema,
    Pick<
      Schema["columns"],
      T extends "*" ? keyof Schema["columns"] : T | Rest[number]
    >
  > {
    if (firstColumn === undefined || firstColumn === "*") {
      this.columnsClause = "*";
      return this as unknown as SelectBuilder<
        Schema,
        Pick<Schema["columns"], keyof Schema["columns"]>
      >;
    }

    this.columnsClause = [firstColumn, ...columns]
      .filter((column) => column)
      .map((c) => snakeCase(c as string))
      .join(", ");

    return this as unknown as SelectBuilder<
      Schema,
      Pick<
        Schema["columns"],
        T extends "*" ? keyof Schema["columns"] : T | Rest[number]
      >
    >;
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
        return `${snakeCase(column)} IN (${values})`;
      }

      return `${snakeCase(column)} ${operator} ${formatCqlValue(value, type)}`;
    });

    // Format clustering conditions properly (if they exist)
    const clustering =
      "clustering" in options && options.clustering
        ? options.clustering.map(([column, operator, value]) => {
            if (operator === "IN") {
              const values = (
                value as unknown as Array<
                  CassandraTypeMap[keyof CassandraTypeMap]["type"]
                >
              )
                .map((v) => `'${v}'`)
                .join(", ");
              return `${snakeCase(column)} IN (${values})`;
            }
            return `${snakeCase(column)} ${operator} '${value}'`;
          })
        : [];

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

    return new SelectStatement<SchemaToType<SelectedColumns>>(
      this.client,
      parts.join(" ") + ";",
    );
  }
}
