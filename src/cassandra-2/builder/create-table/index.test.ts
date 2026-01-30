import { cql } from "../../cql-types";
import { CreateTableBuilder } from "./builder";
import { withOptions } from "../../with-options";
import { expect, test } from "vitest";

const builderExample = CreateTableBuilder.create()
  .table("table")
  .ifNotExists()
  .columns({
    id: cql.scalar.uuid,
    firstName: cql.scalar.text,
    lastName: cql.scalar.text,
    email: cql.scalar.text,
  })
  .primaryKey(["id", "email"], "firstName")
  .clusteringOrderBy({ firstName: "asc" })
  .with(
    withOptions.id("5a1c395e-b41f-11e5-9f22-ba0be0483c18"),
    withOptions.compactStorage(),
  )
  .build();

test("Create table statement", () => {
  expect(builderExample).toBe(
    "CREATE TABLE table IF NOT EXISTS (\nid UUID,\nfirstName TEXT,\nlastName TEXT,\nemail TEXT PRIMARY KEY ( (id, email), firstName )\n) WITH CLUSTERING ORDER BY (firstName asc) AND ID = 5a1c395e-b41f-11e5-9f22-ba0be0483c18 AND COMPACT STORAGE;",
  );
});
