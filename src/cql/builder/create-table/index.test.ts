import { cql } from "../../cql-types";
import { CreateTableBuilder } from "./builder";
import { describe, expect, it, test, vi } from "vitest";
import type { Client } from "cassandra-driver";
import { withOptions } from "../../with-options";
import { CreateTableContext } from "./context";

describe("CreateTableBuilder", () => {
  const mockClient: Client = {
    execute: vi.fn().mockResolvedValue({ rows: [] }),
  } as unknown as Client;

  describe("static create()", () => {
    test("should create a new instance of CreateTableBuilder", () => {
      const builder = CreateTableBuilder.create(mockClient);
      expect(builder).toBeInstanceOf(CreateTableBuilder);
    });
  });

  describe("keyspace()", () => {
    it("should set the keyspace name", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .keyspace("MyKeyspace")
        .table("myTable");
      expect(builder.toCQL()).toContain("my_keyspace");
    });

    it("should convert keyspace name to snake_case", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .keyspace("MyTestKeyspace")
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id");

      expect(builder.toCQL()).toContain("my_test_keyspace.users");
    });
  });

  describe("table()", () => {
    it("should set the table name", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("Users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id");

      expect(builder.toCQL()).toContain("users");
    });

    it("should convert table name to snake_case", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("UserProfiles")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id");

      expect(builder.toCQL()).toContain("user_profiles");
    });
  });

  describe("ifNotExists()", () => {
    it("should add IF NOT EXISTS clause when true", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .keyspace("my_keyspace")
        .table("my_table")
        .ifNotExists(true);

      expect(builder.toCQL()).toContain("IF NOT EXISTS");
    });

    it("should add IF NOT EXISTS clause when called without arguments", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .keyspace("my_keyspace")
        .table("my_table")
        .ifNotExists();

      expect(builder.toCQL()).toContain("IF NOT EXISTS");
    });

    it("should not add IF NOT EXISTS clause when false", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .keyspace("my_keyspace")
        .table("my_table")
        .ifNotExists(false);

      expect(builder.toCQL()).not.toContain("IF NOT EXISTS");
    });
  });

  describe("schema()", () => {
    it("should define table columns", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
          age: cql.scalar.int,
        })
        .primaryKey("id");

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("id");
      expect(cqlString).toContain("name");
      expect(cqlString).toContain("age");
    });

    it("should convert column names to snake_case", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          userId: cql.scalar.uuid,
          firstName: cql.scalar.text,
          lastName: cql.scalar.text,
        })
        .primaryKey("user_id");

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("user_id");
      expect(cqlString).toContain("first_name");
      expect(cqlString).toContain("last_name");
    });

    it("should handle multiple column types", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          id: cql.scalar.uuid,
          timestamp: cql.scalar.timestamp,
          data: cql.scalar.text,
          count: cql.scalar.bigint,
        })
        .primaryKey("id");

      expect(builder.toCQL()).toBeDefined();
    });
  });

  describe("primaryKey()", () => {
    it("should create a primary key with single partition key", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
        })
        .primaryKey("id");

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("PRIMARY KEY");
      expect(cqlString).toMatch(/PRIMARY KEY\s*\(\s*id\s*\)/);
    });

    it("should create a primary key with single partition key and clustering keys", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          userId: cql.scalar.uuid,
          timestamp: cql.scalar.timestamp,
          eventType: cql.scalar.text,
        })
        .primaryKey("user_id", "timestamp", "event_type");

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("PRIMARY KEY");
      expect(cqlString).toContain("user_id");
      expect(cqlString).toContain("timestamp");
      expect(cqlString).toContain("event_type");
    });

    it("should create a composite partition key", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("data")
        .schema({
          year: cql.scalar.int,
          month: cql.scalar.int,
          day: cql.scalar.int,
          value: cql.scalar.text,
        })
        .primaryKey(["year", "month"], "day");

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("PRIMARY KEY");
      expect(cqlString).toMatch(/PRIMARY KEY\s*\(\s*\(\s*year,\s*month\s*\)/);
    });

    it("should handle composite partition key with multiple clustering keys", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("sensor_data")
        .schema({
          sensorId: cql.scalar.uuid,
          locationId: cql.scalar.uuid,
          timestamp: cql.scalar.timestamp,
          reading: cql.scalar.double,
        })
        .primaryKey(["sensor_id", "location_id"], "timestamp", "reading");

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("PRIMARY KEY");
      expect(cqlString).toContain("sensor_id");
      expect(cqlString).toContain("location_id");
      expect(cqlString).toContain("timestamp");
      expect(cqlString).toContain("reading");
    });
  });

  describe("clusteringOrderBy()", () => {
    it("should add clustering order with single key ascending", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          userId: cql.scalar.uuid,
          timestamp: cql.scalar.timestamp,
        })
        .primaryKey("user_id", "timestamp")
        .clusteringOrderBy({ timestamp: "asc" });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("CLUSTERING ORDER BY");
      expect(cqlString).toContain("timestamp asc");
    });

    it("should add clustering order with single key descending", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          userId: cql.scalar.uuid,
          timestamp: cql.scalar.timestamp,
        })
        .primaryKey("user_id", "timestamp")
        .clusteringOrderBy({ timestamp: "desc" });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("CLUSTERING ORDER BY");
      expect(cqlString).toContain("timestamp desc");
    });

    it("should add clustering order with multiple keys", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          userId: cql.scalar.uuid,
          timestamp: cql.scalar.timestamp,
          eventType: cql.scalar.text,
        })
        .primaryKey("user_id", "timestamp", "event_type")
        .clusteringOrderBy({ timestamp: "desc", event_type: "asc" });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("CLUSTERING ORDER BY");
      expect(cqlString).toContain("timestamp desc");
      expect(cqlString).toContain("event_type asc");
    });

    it("should handle partial clustering order specification", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          userId: cql.scalar.uuid,
          timestamp: cql.scalar.timestamp,
          eventType: cql.scalar.text,
        })
        .primaryKey("user_id", "timestamp", "event_type")
        .clusteringOrderBy({ timestamp: "desc" });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("timestamp desc");
    });
  });

  describe("with()", () => {
    it("should add WITH options", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id")
        .with(withOptions.id("some-id"));

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("WITH");
      expect(cqlString).toContain("ID = 'some-id'");
    });

    it("should add multiple WITH options", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id")
        .with(
          withOptions.id("some-id"),
          withOptions.caching({ keys: "all", rowsPerPartition: "all" }),
          withOptions.compactStorage(),
        );

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("WITH");
      expect(cqlString).toContain("ID = 'some-id'");
      expect(cqlString).toContain(
        "CACHING = {'keys': 'ALL','row_per_partition': 'ALL'}",
      );
      expect(cqlString).toContain("COMPACT STORAGE");
      expect(cqlString).toContain("AND");
    });

    it("should chain multiple with() calls", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id")
        .with(withOptions.id("some-id"))
        .with(withOptions.compactStorage());

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("ID = 'some-id'");
      expect(cqlString).toContain("COMPACT STORAGE");
    });

    it("should combine WITH options with clustering order", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          userId: cql.scalar.uuid,
          timestamp: cql.scalar.timestamp,
        })
        .primaryKey("user_id", "timestamp")
        .clusteringOrderBy({ timestamp: "desc" })
        .with(withOptions.id("some-id"));

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("CLUSTERING ORDER BY");
      expect(cqlString).toContain("timestamp desc");
      expect(cqlString).toContain("AND");
      expect(cqlString).toContain("ID = 'some-id'");
    });
  });

  describe("toCQL()", () => {
    it("should generate basic CREATE TABLE statement", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id");

      const cqlString = builder.toCQL();
      expect(cqlString).toMatch(/^CREATE TABLE/);
      expect(cqlString).toContain("users");
      expect(cqlString).toContain("PRIMARY KEY");
      expect(cqlString).toMatch(/;$/);
    });
  });

  it("should generate CREATE TABLE with keyspace", () => {
    const builder = CreateTableBuilder.create(mockClient)
      .keyspace("test_keyspace")
      .table("users")
      .schema({ id: cql.scalar.uuid })
      .primaryKey("id");

    const cqlString = builder.toCQL();
    expect(cqlString).toContain("test_keyspace.users");
  });

  it("should generate CREATE TABLE IF NOT EXISTS", () => {
    const builder = CreateTableBuilder.create(mockClient)
      .table("users")
      .ifNotExists()
      .schema({ id: cql.scalar.uuid })
      .primaryKey("id");

    const cqlString = builder.toCQL();
    expect(cqlString).toMatch(/CREATE TABLE .* IF NOT EXISTS/);
  });

  it("should generate CREATE TABLE IF NOT EXISTS", () => {
    const builder = CreateTableBuilder.create(mockClient)
      .table("users")
      .ifNotExists()
      .schema({ id: cql.scalar.uuid })
      .primaryKey("id");

    const cqlString = builder.toCQL();
    expect(cqlString).toMatch(/CREATE TABLE .* IF NOT EXISTS/);
  });

  it("should generate complete CQL with all features", () => {
    const builder = CreateTableBuilder.create(mockClient)
      .keyspace("my_keyspace")
      .table("events")
      .ifNotExists()
      .schema({
        userId: cql.scalar.uuid,
        timestamp: cql.scalar.timestamp,
        eventType: cql.scalar.text,
        data: cql.scalar.text,
      })
      .primaryKey("user_id", "timestamp", "event_type")
      .clusteringOrderBy({ timestamp: "desc", event_type: "asc" })
      .with(withOptions.id("some-id"));

    const cqlString = builder.toCQL();
    expect(cqlString).toContain("CREATE TABLE");
    expect(cqlString).toContain("my_keyspace.events");
    expect(cqlString).toContain("IF NOT EXISTS");
    expect(cqlString).toContain("user_id");
    expect(cqlString).toContain("timestamp");
    expect(cqlString).toContain("event_type");
    expect(cqlString).toContain("data");
    expect(cqlString).toContain("PRIMARY KEY");
    expect(cqlString).toContain("CLUSTERING ORDER BY");
    expect(cqlString).toContain("WITH");
    expect(cqlString).toMatch(/;$/);
  });

  it("should handle minimal table without keyspace", () => {
    const builder = CreateTableBuilder.create(mockClient)
      .table("simple")
      .schema({ id: cql.scalar.uuid })
      .primaryKey("id");

    const cqlString = builder.toCQL();
    expect(cqlString).toMatch(/^CREATE TABLE simple/);
    expect(cqlString).not.toContain(".");
  });

  describe("build()", () => {
    it("should return a CreateTableContext instance", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id");

      const context = builder.build();
      expect(context).toBeInstanceOf(CreateTableContext);
    });

    it("should preserve the context information", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .keyspace("test_keyspace")
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
        })
        .primaryKey("id");

      const context = builder.build().getContext();
      expect(context).toBeDefined();
      expect(context.keyspace).toBe("test_keyspace");
      expect(context.table).toBe("users");
      expect(context.columns).toEqual({
        id: cql.scalar.uuid,
        name: cql.scalar.text,
      });
      expect(context.partitionKeys).toEqual(["id"]);
    });

    it("should have a select method on the context", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id");

      const context = builder.build();
      expect(context.select).toBeDefined();
      expect(typeof context.select).toBe("function");
    });

    it("should generate the same CQL from context", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .keyspace("test")
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id");

      const builderCQL = builder.toCQL();
      const context = builder.build();
      const contextCQL = context.toCQL();

      expect(contextCQL).toBe(builderCQL);
    });
  });

  describe("CreateTableContext", () => {
    it("should execute the CREATE TABLE statement", async () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id");

      const context = builder.build();
      await context.execute();

      expect(mockClient.execute).toHaveBeenLastCalledWith(
        expect.stringContaining("CREATE TABLE users"),
      );
    });

    it("should execute with all CQL features", async () => {
      const option = withOptions.id("some-id");

      const builder = CreateTableBuilder.create(mockClient)
        .keyspace("test")
        .table("events")
        .ifNotExists()
        .schema({
          userId: cql.scalar.uuid,
          timestamp: cql.scalar.timestamp,
        })
        .primaryKey("user_id", "timestamp")
        .clusteringOrderBy({ timestamp: "desc" })
        .with(option);

      const context = builder.build();
      await context.execute();

      expect(mockClient.execute).toHaveBeenLastCalledWith(
        expect.stringMatching(/CREATE TABLE test\.events IF NOT EXISTS .*/),
      );
    });
  });

  describe("method chaining", () => {
    it("should allow chaining all methods", () => {
      expect(() => {
        CreateTableBuilder.create(mockClient)
          .keyspace("test")
          .table("users")
          .ifNotExists()
          .schema({
            id: cql.scalar.uuid,
            timestamp: cql.scalar.timestamp,
          })
          .primaryKey("id", "timestamp")
          .clusteringOrderBy({ timestamp: "desc" })
          .with(withOptions.compactStorage())
          .build();
      }).not.toThrow();
    });

    it("should maintain immutability through cloning", () => {
      const base = CreateTableBuilder.create(mockClient).table("users");
      const withKeyspace = base.keyspace("test");

      // Base should not have keyspace in its CQL
      expect(base.toCQL()).not.toContain("test.");
      // New instance should have keyspace
      expect(withKeyspace.toCQL()).toContain("test.");
    });
  });

  describe("edge cases", () => {
    it("should handle table with only required fields", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("minimal")
        .schema({ key: cql.scalar.text })
        .primaryKey("key");

      expect(builder.toCQL()).toMatch(
        /CREATE TABLE minimal \([\s\S]*key[\s\S]*PRIMARY KEY[\s\S]*\);/,
      );
    });

    it("should handle table with many columns", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("large")
        .schema({
          id: cql.scalar.uuid,
          col1: cql.scalar.text,
          col2: cql.scalar.int,
          col3: cql.scalar.bigint,
          col4: cql.scalar.timestamp,
          col5: cql.scalar.boolean,
          col6: cql.scalar.double,
          col7: cql.scalar.float,
        })
        .primaryKey("id");

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("col1");
      expect(cqlString).toContain("col7");
    });

    it("should handle complex composite keys", () => {
      const builder = CreateTableBuilder.create(mockClient)
        .table("complex")
        .schema({
          part1: cql.scalar.uuid,
          part2: cql.scalar.text,
          part3: cql.scalar.int,
          cluster1: cql.scalar.timestamp,
          cluster2: cql.scalar.text,
          data: cql.scalar.text,
        })
        .primaryKey(["part1", "part2", "part3"], "cluster1", "cluster2");

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("part1");
      expect(cqlString).toContain("part2");
      expect(cqlString).toContain("part3");
      expect(cqlString).toContain("cluster1");
      expect(cqlString).toContain("cluster2");
      expect(cqlString).toMatch(/PRIMARY KEY\s*\(\s*\(/);
    });
  });
});
