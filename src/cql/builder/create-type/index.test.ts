import { cql } from "../../cql-types";
import { CreateTypeBuilder } from "./builder";
import { expect, test } from "vitest";
import { CreateTypeContext } from "./context";
import type { Client, types } from "cassandra-driver";

const mockClient = {
  async execute() {
    return undefined as unknown as Promise<types.ResultSet>;
  },
} as unknown as Client;

const example = CreateTypeBuilder.create(mockClient)
  .type("address")
  .ifNotExists()
  .schema({
    city: cql.scalar.text,
    country: cql.scalar.text,
  });

test("Create type statement", () => {
  const cql = example.toCQL();

  expect(cql).toBe(
    "CREATE TYPE address IF NOT EXISTS (\ncity TEXT,\ncountry TEXT);",
  );
});

test("Create type context", async () => {
  const context = example.build();

  expect(context).toBeInstanceOf(CreateTypeContext);

  expect(context.toCQL()).toBe(
    "CREATE TYPE address IF NOT EXISTS (\ncity TEXT,\ncountry TEXT);",
  );

  const result = await context.execute();

  expect(result).toBe(undefined); // Execute should return Promise<void>
});
