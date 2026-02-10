import { cql } from "../../cql-types";
import { CreateTableBuilder } from "./builder";
import { withOptions } from "../../with-options";
import { expect, test } from "vitest";
import { CreateTableContext } from "./context";
import type { Client } from "cassandra-driver";

const city = cql.udt("city", {
  name: cql.scalar.text,
  postalCode: cql.scalar.int,
});

const address = cql.udt("address", {
  country: cql.scalar.text,
  city: city,
});

const example = CreateTableBuilder.create({} as Client)
  .table("example")
  .ifNotExists()
  .schema({
    id: cql.scalar.uuid,
    first_name: cql.scalar.text,
    last_name: cql.scalar.text,
    email: cql.scalar.text,
    address,
  })
  .primaryKey("id", "email", "first_name")
  .clusteringOrderBy({ first_name: "desc" })
  .with(
    withOptions.id("5a1c395e-b41f-11e5-9f22-ba0be0483c18"),
    withOptions.compactStorage(),
  );

test("Create table statement", () => {
  const cql = example.toCQL();

  console.log(cql);

  expect(cql).toBe(
    "CREATE TABLE example IF NOT EXISTS (\nid UUID,\nfirstName TEXT,\nlastName TEXT,\nemail TEXT PRIMARY KEY ( (id, email), firstName )\n) WITH CLUSTERING ORDER BY (firstName asc) AND ID = 5a1c395e-b41f-11e5-9f22-ba0be0483c18 AND COMPACT STORAGE;",
  );
});

test("Create table context", async () => {
  const context = example.build();

  const result = await context.select("email", "last_name").build().execute();

  expect(context).toBeInstanceOf(CreateTableContext);

  expect(context.toCQL()).toBe(
    "CREATE TABLE example IF NOT EXISTS (\nid UUID,\nfirstName TEXT,\nlastName TEXT,\nemail TEXT PRIMARY KEY ( (id, email), firstName )\n) WITH CLUSTERING ORDER BY (firstName asc) AND ID = 5a1c395e-b41f-11e5-9f22-ba0be0483c18 AND COMPACT STORAGE;",
  );

  // const result = await context.execute();

  // expect(result).toBe(undefined); // Execute should return Promise<void>
});
