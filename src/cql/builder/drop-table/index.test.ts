import { DropTableBuilder } from "./builder";
import { DropTableContext } from "./context";
import { describe, expect, it, test, vi, beforeEach } from "vitest";
import type { Client } from "cassandra-driver";

describe("DropTableBuilder", () => {
  let mockClient: Client;

  beforeEach(() => {
    mockClient = {
      execute: vi.fn().mockResolvedValue({ rows: [] }),
    } as unknown as Client;
  });

  describe("static create()", () => {
    test("should create a new instance of DropTableBuilder", () => {
      const builder = DropTableBuilder.create(mockClient);
      expect(builder).toBeInstanceOf(DropTableBuilder);
    });
  });

  describe("keyspace()", () => {
    it("should set the keyspace name", () => {
      const builder = DropTableBuilder.create(mockClient)
        .keyspace("my_keyspace")
        .table("users");

      expect(builder.toCQL()).toContain("my_keyspace.users");
    });

    it("should handle various keyspace names", () => {
      const builder = DropTableBuilder.create(mockClient)
        .keyspace("test_keyspace_123")
        .table("events");

      expect(builder.toCQL()).toContain("test_keyspace_123.events");
    });
  });

  describe("table()", () => {
    it("should set the table name", () => {
      const builder = DropTableBuilder.create(mockClient).table("users");

      expect(builder.toCQL()).toContain("users");
    });

    it("should preserve table name casing", () => {
      const builder = DropTableBuilder.create(mockClient).table("UserProfiles");

      expect(builder.toCQL()).toContain("UserProfiles");
    });

    it("should handle table names with underscores", () => {
      const builder =
        DropTableBuilder.create(mockClient).table("user_profile_data");

      expect(builder.toCQL()).toContain("user_profile_data");
    });
  });

  describe("ifExists()", () => {
    it("should add IF EXISTS clause when true", () => {
      const builder = DropTableBuilder.create(mockClient)
        .table("users")
        .ifExists(true);

      expect(builder.toCQL()).toContain("IF EXISTS");
    });

    it("should add IF EXISTS clause when called without arguments", () => {
      const builder = DropTableBuilder.create(mockClient)
        .table("users")
        .ifExists();

      expect(builder.toCQL()).toContain("IF EXISTS");
    });

    it("should not add IF EXISTS clause when false", () => {
      const builder = DropTableBuilder.create(mockClient)
        .table("users")
        .ifExists(false);

      expect(builder.toCQL()).not.toContain("IF EXISTS");
    });

    it("should position IF EXISTS correctly in CQL", () => {
      const builder = DropTableBuilder.create(mockClient)
        .keyspace("test")
        .table("users")
        .ifExists();

      const cqlString = builder.toCQL();
      const ifExistsIndex = cqlString.indexOf("IF EXISTS");
      const tableIndex = cqlString.indexOf("test.users");
      expect(ifExistsIndex).toBeLessThan(tableIndex);
    });
  });

  describe("toCQL()", () => {
    it("should generate basic DROP TABLE statement", () => {
      const builder = DropTableBuilder.create(mockClient).table("users");

      const cqlString = builder.toCQL();
      expect(cqlString).toMatch(/^DROP TABLE/);
      expect(cqlString).toContain("users");
      expect(cqlString).toMatch(/;$/);
    });

    it("should generate DROP TABLE with keyspace", () => {
      const builder = DropTableBuilder.create(mockClient)
        .keyspace("test_keyspace")
        .table("users");

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("test_keyspace.users");
    });

    it("should generate DROP TABLE IF EXISTS", () => {
      const builder = DropTableBuilder.create(mockClient)
        .table("users")
        .ifExists();

      const cqlString = builder.toCQL();
      expect(cqlString).toMatch(/DROP TABLE IF EXISTS/);
    });

    it("should generate complete CQL statement", () => {
      const builder = DropTableBuilder.create(mockClient)
        .keyspace("my_keyspace")
        .table("user_events")
        .ifExists();

      const cqlString = builder.toCQL();
      expect(cqlString).toBe("DROP TABLE IF EXISTS my_keyspace.user_events;");
    });

    it("should generate table without keyspace", () => {
      const builder = DropTableBuilder.create(mockClient).table("simple_table");

      const cqlString = builder.toCQL();
      expect(cqlString).toBe("DROP TABLE simple_table;");
      expect(cqlString).not.toContain(".");
    });

    it("should throw error when table name is missing", () => {
      // eslint-disable-next-line
      const builder = DropTableBuilder.create(mockClient) as any;

      expect(() => builder.toCQL()).toThrow("Table name is required");
    });
  });

  describe("build()", () => {
    it("should return a DropTableContext instance", () => {
      const builder = DropTableBuilder.create(mockClient).table("users");

      const context = builder.build();
      expect(context).toBeInstanceOf(DropTableContext);
    });

    it("should generate the same CQL from context", () => {
      const builder = DropTableBuilder.create(mockClient)
        .keyspace("test")
        .table("users")
        .ifExists();

      const builderCQL = builder.toCQL();
      const context = builder.build();
      const contextCQL = context.toCQL();

      expect(contextCQL).toBe(builderCQL);
    });
  });

  describe("DropTableContext", () => {
    describe("execute()", () => {
      it("should execute the DROP TABLE statement", async () => {
        const builder = DropTableBuilder.create(mockClient).table("users");
        const context = builder.build();

        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          expect.stringContaining("DROP TABLE users"),
        );
      });

      it("should execute with keyspace", async () => {
        const builder = DropTableBuilder.create(mockClient)
          .keyspace("test")
          .table("users");

        const context = builder.build();
        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          "DROP TABLE test.users;",
        );
      });

      it("should execute with IF EXISTS", async () => {
        const builder = DropTableBuilder.create(mockClient)
          .table("users")
          .ifExists();

        const context = builder.build();
        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          "DROP TABLE IF EXISTS users;",
        );
      });

      it("should handle execution errors", async () => {
        const errorClient = {
          execute: vi.fn().mockRejectedValue(new Error("Execution failed")),
        } as unknown as Client;

        const builder = DropTableBuilder.create(errorClient).table("users");
        const context = builder.build();

        await expect(context.execute()).rejects.toThrow("Execution failed");
      });
    });

    describe("toCQL()", () => {
      it("should return the CQL statement", () => {
        const builder = DropTableBuilder.create(mockClient).table("users");
        const context = builder.build();

        const cqlString = context.toCQL();
        expect(cqlString).toContain("DROP TABLE");
        expect(cqlString).toContain("users");
      });
    });
  });

  describe("method chaining", () => {
    it("should allow chaining all methods", () => {
      expect(() => {
        DropTableBuilder.create(mockClient)
          .keyspace("test")
          .table("users")
          .ifExists()
          .build();
      }).not.toThrow();
    });

    it("should allow table before keyspace", () => {
      expect(() => {
        DropTableBuilder.create(mockClient)
          .table("users")
          .keyspace("test")
          .build();
      }).not.toThrow();
    });

    it("should maintain immutability through cloning", () => {
      const base = DropTableBuilder.create(mockClient).table("users");
      const withKeyspace = base.keyspace("test");

      expect(base.toCQL()).toBe("DROP TABLE users;");
      expect(withKeyspace.toCQL()).toBe("DROP TABLE test.users;");
    });
  });

  describe("edge cases", () => {
    it("should handle simple table drop", () => {
      const builder = DropTableBuilder.create(mockClient).table("minimal");

      expect(builder.toCQL()).toBe("DROP TABLE minimal;");
    });

    it("should handle special characters in table names", () => {
      const builder =
        DropTableBuilder.create(mockClient).table("table_v1_final");

      expect(builder.toCQL()).toContain("table_v1_final");
    });

    it("should throw error when building without table name", () => {
      // eslint-disable-next-line
      const builder = DropTableBuilder.create(mockClient).ifExists() as any;

      expect(() => builder.build()).toThrow("Table name is required");
    });
  });

  describe("real-world scenarios", () => {
    it("should drop a users table", async () => {
      const builder = DropTableBuilder.create(mockClient)
        .keyspace("app")
        .table("users")
        .ifExists();

      const context = builder.build();
      await context.execute();

      expect(mockClient.execute).toHaveBeenCalledWith(
        "DROP TABLE IF EXISTS app.users;",
      );
    });

    it("should drop an events table without if exists", async () => {
      const builder = DropTableBuilder.create(mockClient).table("user_events");

      const context = builder.build();
      await context.execute();

      expect(mockClient.execute).toHaveBeenCalledWith(
        "DROP TABLE user_events;",
      );
    });

    it("should safely drop a table that might not exist", async () => {
      const builder = DropTableBuilder.create(mockClient)
        .keyspace("analytics")
        .table("sensor_data")
        .ifExists();

      expect(builder.toCQL()).toBe(
        "DROP TABLE IF EXISTS analytics.sensor_data;",
      );
    });

    it("should drop a temporary table", async () => {
      const builder = DropTableBuilder.create(mockClient)
        .table("temp_processing")
        .ifExists();

      const context = builder.build();
      await context.execute();

      expect(mockClient.execute).toHaveBeenCalledWith(
        "DROP TABLE IF EXISTS temp_processing;",
      );
    });
  });
});
