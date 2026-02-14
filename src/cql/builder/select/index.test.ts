import { cql } from "../../cql-types";
import { CreateTableBuilder } from "../create-table/builder";
import { SelectBuilder } from "./builder";
import { SelectContext } from "./context";
import { describe, expect, it, test, vi, beforeEach } from "vitest";
import type { Client } from "cassandra-driver";

describe("SelectBuilder", () => {
  const mockClient: Client = {
    execute: vi.fn().mockResolvedValue({ rows: [] }),
  } as unknown as Client;

  describe("static from()", () => {
    test("should create a new instance from CreateTableContext", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({ id: cql.scalar.uuid, name: cql.scalar.text })
        .primaryKey("id")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext);
      expect(builder).toBeInstanceOf(SelectBuilder);
    });

    test("should preserve table context", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .keyspace("test")
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext);
      expect(builder).toBeDefined();
    });
  });

  describe("select()", () => {
    let tableContext: ReturnType<
      ReturnType<typeof CreateTableBuilder.create>["build"]
    >;

    beforeEach(() => {
      tableContext = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
          email: cql.scalar.text,
          age: cql.scalar.int,
        })
        .primaryKey("id")
        .build();
    });

    it("should select all columns with no arguments", () => {
      const builder = SelectBuilder.from(mockClient, tableContext).select();

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("SELECT *");
    });

    it("should select all columns with asterisk", () => {
      const builder = SelectBuilder.from(mockClient, tableContext).select("*");

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("SELECT *");
    });

    it("should select a single column", () => {
      const builder = SelectBuilder.from(mockClient, tableContext).select("id");

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("SELECT id");
      expect(cqlString).not.toContain("name");
      expect(cqlString).not.toContain("email");
    });

    it("should select multiple columns", () => {
      const builder = SelectBuilder.from(mockClient, tableContext).select(
        "id",
        "name",
        "email",
      );

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("SELECT id, name, email");
    });

    it("should select all available columns", () => {
      const builder = SelectBuilder.from(mockClient, tableContext).select(
        "id",
        "name",
        "email",
        "age",
      );

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("SELECT id, name, email, age");
    });

    it("should handle column selection in any order", () => {
      const builder = SelectBuilder.from(mockClient, tableContext).select(
        "email",
        "id",
        "name",
      );

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("SELECT email, id, name");
    });

    it("should handle snake_case column names", () => {
      const snakeTableContext = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          userId: cql.scalar.uuid,
          firstName: cql.scalar.text,
          lastName: cql.scalar.text,
        })
        .primaryKey("user_id")
        .build();

      const builder = SelectBuilder.from(mockClient, snakeTableContext).select(
        "user_id",
        "first_name",
      );

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("user_id");
      expect(cqlString).toContain("first_name");
    });
  });

  describe("where()", () => {
    it("should add WHERE condition with equality operator", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
        })
        .primaryKey("id")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext)
        .select("id", "name")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000");

      expect(builder).toBeDefined();
    });

    it("should add WHERE condition on partition key", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          userId: cql.scalar.uuid,
          timestamp: cql.scalar.timestamp,
          data: cql.scalar.text,
        })
        .primaryKey("user_id", "timestamp")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext)
        .select("*")
        .where("user_id", "=", "123e4567-e89b-12d3-a456-426614174000");

      expect(builder).toBeDefined();
    });

    it("should add WHERE condition on clustering key", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          userId: cql.scalar.uuid,
          timestamp: cql.scalar.timestamp,
          data: cql.scalar.text,
        })
        .primaryKey("user_id", "timestamp")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext)
        .select("*")
        .where("user_id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .where("timestamp", ">", new Date());

      expect(builder).toBeDefined();
    });

    it("should support multiple WHERE conditions", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("sensor_data")
        .schema({
          sensorId: cql.scalar.uuid,
          locationId: cql.scalar.uuid,
          timestamp: cql.scalar.timestamp,
          value: cql.scalar.double,
        })
        .primaryKey(["sensor_id", "location_id"], "timestamp")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext)
        .select("*")
        .where("sensor_id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .where("location_id", "=", "987fcdeb-51a2-43f7-8765-123456789abc");

      expect(builder).toBeDefined();
    });

    it("should support comparison operators on clustering keys", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("time_series")
        .schema({
          deviceId: cql.scalar.uuid,
          timestamp: cql.scalar.timestamp,
          reading: cql.scalar.double,
        })
        .primaryKey("device_id", "timestamp")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext)
        .select("*")
        .where("device_id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .where("timestamp", ">=", new Date("2024-01-01"));

      expect(builder).toBeDefined();
    });

    it("should chain multiple WHERE conditions", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          userId: cql.scalar.uuid,
          eventType: cql.scalar.text,
          timestamp: cql.scalar.timestamp,
          data: cql.scalar.text,
        })
        .primaryKey("user_id", "event_type", "timestamp")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext)
        .select("data", "timestamp")
        .where("user_id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .where("event_type", "=", "click")
        .where("timestamp", ">", new Date("2024-01-01"));

      expect(builder).toBeDefined();
    });
  });

  describe("toCQL()", () => {
    it("should generate basic SELECT statement", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select("id");

      const cqlString = builder.toCQL();
      expect(cqlString).toMatch(/^SELECT id FROM users;$/);
    });

    it("should generate SELECT with multiple columns", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
          email: cql.scalar.text,
        })
        .primaryKey("id")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select(
        "id",
        "name",
        "email",
      );

      const cqlString = builder.toCQL();
      expect(cqlString).toBe("SELECT id, name, email FROM users;");
    });

    it("should generate SELECT * statement", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
        })
        .primaryKey("id")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select("*");

      const cqlString = builder.toCQL();
      expect(cqlString).toBe("SELECT * FROM users;");
    });

    it("should handle table names correctly", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("user_profiles")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select("*");

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("FROM user_profiles");
    });

    it("should generate clean CQL with proper spacing", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("data")
        .schema({
          key: cql.scalar.text,
          value: cql.scalar.text,
        })
        .primaryKey("key")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select(
        "key",
        "value",
      );

      const cqlString = builder.toCQL();
      expect(cqlString).toMatch(/SELECT .+ FROM .+;/);
      expect(cqlString).not.toContain("  "); // No double spaces
    });

    it("should end with semicolon", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select("*");

      const cqlString = builder.toCQL();
      expect(cqlString).toMatch(/;$/);
    });
  });

  describe("build()", () => {
    it("should return a SelectContext instance", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select("id");

      const context = builder.build();
      expect(context).toBeInstanceOf(SelectContext);
    });

    it("should preserve select and table context", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
        })
        .primaryKey("id")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select(
        "id",
        "name",
      );

      const context = builder.build();
      expect(context.context).toBeDefined();
      expect(context.context.select).toBeDefined();
      expect(context.context.table).toBeDefined();
    });

    it("should generate the same CQL from context", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select("id");

      const builderCQL = builder.toCQL();
      const context = builder.build();
      const contextCQL = context.getCQL();

      expect(contextCQL).toBe(builderCQL);
    });

    it("should work with complex table schemas", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .keyspace("analytics")
        .table("events")
        .schema({
          userId: cql.scalar.uuid,
          eventType: cql.scalar.text,
          timestamp: cql.scalar.timestamp,
          metadata: cql.scalar.text,
        })
        .primaryKey("user_id", "event_type", "timestamp")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select(
        "user_id",
        "event_type",
        "timestamp",
      );

      const context = builder.build();
      expect(context).toBeInstanceOf(SelectContext);
    });
  });

  describe("SelectContext", () => {
    describe("getCQL()", () => {
      it("should return the CQL statement", () => {
        const tableContext = CreateTableBuilder.create(mockClient)
          .table("users")
          .schema({ id: cql.scalar.uuid })
          .primaryKey("id")
          .build();

        const context = SelectBuilder.from(mockClient, tableContext)
          .select("id")
          .build();

        const cqlString = context.getCQL();
        expect(cqlString).toContain("SELECT");
        expect(cqlString).toContain("FROM users");
      });
    });

    describe("execute()", () => {
      it("should execute the SELECT statement", async () => {
        const tableContext = CreateTableBuilder.create(mockClient)
          .table("users")
          .schema({ id: cql.scalar.uuid })
          .primaryKey("id")
          .build();

        const context = SelectBuilder.from(mockClient, tableContext)
          .select("id")
          .build();

        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          expect.stringContaining("SELECT id FROM users"),
        );
      });

      it("should return query results", async () => {
        const mockRows = [
          { id: "123e4567-e89b-12d3-a456-426614174000" },
          { id: "987fcdeb-51a2-43f7-8765-123456789abc" },
        ];

        const clientWithResults = {
          execute: vi.fn().mockResolvedValue({ rows: mockRows }),
        } as unknown as Client;

        const tableContext = CreateTableBuilder.create(clientWithResults)
          .table("users")
          .schema({ id: cql.scalar.uuid })
          .primaryKey("id")
          .build();

        const context = SelectBuilder.from(clientWithResults, tableContext)
          .select("id")
          .build();

        const results = await context.execute();
        expect(results).toEqual(mockRows);
      });

      it("should execute SELECT with multiple columns", async () => {
        const tableContext = CreateTableBuilder.create(mockClient)
          .table("users")
          .schema({
            id: cql.scalar.uuid,
            name: cql.scalar.text,
            email: cql.scalar.text,
          })
          .primaryKey("id")
          .build();

        const context = SelectBuilder.from(mockClient, tableContext)
          .select("id", "name", "email")
          .build();

        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          "SELECT id, name, email FROM users;",
        );
      });

      it("should execute SELECT * statement", async () => {
        const tableContext = CreateTableBuilder.create(mockClient)
          .table("users")
          .schema({
            id: cql.scalar.uuid,
            name: cql.scalar.text,
          })
          .primaryKey("id")
          .build();

        const context = SelectBuilder.from(mockClient, tableContext)
          .select("*")
          .build();

        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith("SELECT * FROM users;");
      });

      it("should handle execution errors", async () => {
        const errorClient = {
          execute: vi.fn().mockRejectedValue(new Error("Query failed")),
        } as unknown as Client;

        const tableContext = CreateTableBuilder.create(errorClient)
          .table("users")
          .schema({ id: cql.scalar.uuid })
          .primaryKey("id")
          .build();

        const context = SelectBuilder.from(errorClient, tableContext)
          .select("id")
          .build();

        await expect(context.execute()).rejects.toThrow("Query failed");
      });

      it("should handle empty result sets", async () => {
        const clientWithEmptyResults = {
          execute: vi.fn().mockResolvedValue({ rows: [] }),
        } as unknown as Client;

        const tableContext = CreateTableBuilder.create(clientWithEmptyResults)
          .table("users")
          .schema({ id: cql.scalar.uuid })
          .primaryKey("id")
          .build();

        const context = SelectBuilder.from(clientWithEmptyResults, tableContext)
          .select("id")
          .build();

        const results = await context.execute();
        expect(results).toEqual([]);
      });
    });
  });

  describe("method chaining", () => {
    it("should allow chaining select and build", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id")
        .build();

      expect(() => {
        SelectBuilder.from(mockClient, tableContext).select("id").build();
      }).not.toThrow();
    });

    it("should allow chaining select and where", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
        })
        .primaryKey("id")
        .build();

      expect(() => {
        SelectBuilder.from(mockClient, tableContext)
          .select("id", "name")
          .where("id", "=", "123e4567-e89b-12d3-a456-426614174000");
      }).not.toThrow();
    });

    it("should maintain immutability through cloning", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
          email: cql.scalar.text,
        })
        .primaryKey("id")
        .build();

      const base = SelectBuilder.from(mockClient, tableContext).select("id");
      const withName = base.select("id", "name");

      const baseCQL = base.toCQL();
      const withNameCQL = withName.toCQL();

      expect(baseCQL).toContain("SELECT id FROM");
      expect(withNameCQL).toContain("SELECT id, name FROM");
      expect(baseCQL).not.toBe(withNameCQL);
    });

    it("should allow building from intermediate steps", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
        })
        .primaryKey("id")
        .build();

      const selectStep = SelectBuilder.from(mockClient, tableContext).select(
        "id",
        "name",
      );

      const context1 = selectStep.build();
      const context2 = selectStep.build();

      expect(context1.getCQL()).toBe(context2.getCQL());
    });
  });

  describe("edge cases", () => {
    it("should handle single column table", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("counters")
        .schema({ value: cql.scalar.int })
        .primaryKey("value")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select(
        "value",
      );

      expect(builder.toCQL()).toBe("SELECT value FROM counters;");
    });

    it("should handle tables with many columns", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("wide_table")
        .schema({
          id: cql.scalar.uuid,
          col1: cql.scalar.text,
          col2: cql.scalar.text,
          col3: cql.scalar.text,
          col4: cql.scalar.text,
          col5: cql.scalar.text,
        })
        .primaryKey("id")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select(
        "id",
        "col1",
        "col2",
        "col3",
        "col4",
        "col5",
      );

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("col1");
      expect(cqlString).toContain("col5");
    });

    it("should handle composite partition keys", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("multi_partition")
        .schema({
          part1: cql.scalar.uuid,
          part2: cql.scalar.text,
          data: cql.scalar.text,
        })
        .primaryKey(["part1", "part2"])
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select("*");

      expect(builder.toCQL()).toBe("SELECT * FROM multi_partition;");
    });

    it("should handle complex clustering keys", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("time_series")
        .schema({
          deviceId: cql.scalar.uuid,
          year: cql.scalar.int,
          month: cql.scalar.int,
          day: cql.scalar.int,
          value: cql.scalar.double,
        })
        .primaryKey("device_id", "year", "month", "day")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select(
        "device_id",
        "year",
        "month",
        "day",
        "value",
      );

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("device_id");
      expect(cqlString).toContain("year");
      expect(cqlString).toContain("month");
      expect(cqlString).toContain("day");
      expect(cqlString).toContain("value");
    });
  });

  describe("real-world scenarios", () => {
    it("should select user by ID", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .keyspace("app")
        .table("users")
        .schema({
          userId: cql.scalar.uuid,
          username: cql.scalar.text,
          email: cql.scalar.text,
          createdAt: cql.scalar.timestamp,
        })
        .primaryKey("user_id")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select(
        "user_id",
        "username",
        "email",
      );

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("SELECT user_id, username, email");
      expect(cqlString).toContain("FROM users");
    });

    it("should select time-series data", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .keyspace("metrics")
        .table("sensor_readings")
        .schema({
          sensorId: cql.scalar.uuid,
          timestamp: cql.scalar.timestamp,
          temperature: cql.scalar.double,
          humidity: cql.scalar.double,
        })
        .primaryKey("sensor_id", "timestamp")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select(
        "timestamp",
        "temperature",
        "humidity",
      );

      expect(builder.toCQL()).toContain(
        "SELECT timestamp, temperature, humidity",
      );
    });

    it("should select from event log", async () => {
      const mockEvents = [
        {
          user_id: "123e4567-e89b-12d3-a456-426614174000",
          event_type: "login",
          timestamp: new Date(),
        },
        {
          user_id: "123e4567-e89b-12d3-a456-426614174000",
          event_type: "logout",
          timestamp: new Date(),
        },
      ];

      const clientWithEvents = {
        execute: vi.fn().mockResolvedValue({ rows: mockEvents }),
      } as unknown as Client;

      const tableContext = CreateTableBuilder.create(clientWithEvents)
        .keyspace("analytics")
        .table("user_events")
        .schema({
          userId: cql.scalar.uuid,
          eventType: cql.scalar.text,
          timestamp: cql.scalar.timestamp,
        })
        .primaryKey("user_id", "timestamp")
        .build();

      const context = SelectBuilder.from(clientWithEvents, tableContext)
        .select("*")
        .build();

      const results = await context.execute();
      expect(results).toEqual(mockEvents);
      expect(results).toHaveLength(2);
    });

    it("should work with the select method from CreateTableContext", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("products")
        .schema({
          productId: cql.scalar.uuid,
          name: cql.scalar.text,
          price: cql.scalar.decimal,
        })
        .primaryKey("product_id")
        .build();

      // Using the select method directly from CreateTableContext
      const builder = tableContext.select("product_id", "name");

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("SELECT product_id, name");
      expect(cqlString).toContain("FROM products");
    });

    it("should handle SELECT for shopping cart", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .keyspace("ecommerce")
        .table("shopping_carts")
        .schema({
          userId: cql.scalar.uuid,
          itemId: cql.scalar.uuid,
          quantity: cql.scalar.int,
          addedAt: cql.scalar.timestamp,
        })
        .primaryKey("user_id", "item_id")
        .build();

      const builder = SelectBuilder.from(mockClient, tableContext).select(
        "item_id",
        "quantity",
        "added_at",
      );

      expect(builder.toCQL()).toContain(
        "SELECT item_id, quantity, added_at FROM shopping_carts",
      );
    });
  });

  describe("integration with CreateTableContext", () => {
    it("should use select() method from table context", () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
        })
        .primaryKey("id")
        .build();

      const selectBuilder = tableContext.select("id", "name");

      expect(selectBuilder).toBeInstanceOf(SelectBuilder);
      expect(selectBuilder.toCQL()).toContain("SELECT id, name FROM users");
    });

    it("should chain from table creation to selection", () => {
      const query = CreateTableBuilder.create(mockClient)
        .table("messages")
        .schema({
          messageId: cql.scalar.uuid,
          content: cql.scalar.text,
          sentAt: cql.scalar.timestamp,
        })
        .primaryKey("message_id")
        .build()
        .select("message_id", "content", "sent_at");

      expect(query.toCQL()).toContain(
        "SELECT message_id, content, sent_at FROM messages",
      );
    });

    it("should work with complex table definitions", async () => {
      const tableContext = CreateTableBuilder.create(mockClient)
        .keyspace("social")
        .table("user_timeline")
        .ifNotExists()
        .schema({
          userId: cql.scalar.uuid,
          postId: cql.scalar.uuid,
          timestamp: cql.scalar.timestamp,
          content: cql.scalar.text,
        })
        .primaryKey("user_id", "timestamp", "post_id")
        .clusteringOrderBy({ timestamp: "desc" })
        .build();

      const selectContext = tableContext
        .select("post_id", "content", "timestamp")
        .build();

      await selectContext.execute();

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT post_id, content, timestamp"),
      );
    });
  });
});
