import { cql } from "../../cql-types";
import { DeleteBuilder } from "./builder";
import { DeleteContext } from "./context";
import { CreateTableBuilder } from "../create-table/builder";
import { describe, expect, it, test, vi, beforeEach } from "vitest";
import type { Client } from "cassandra-driver";

describe("DeleteBuilder", () => {
  let mockClient: Client;

  beforeEach(() => {
    mockClient = {
      execute: vi.fn().mockResolvedValue({ rows: [] }),
    } as unknown as Client;
  });

  // -------------------------------------------------------------------------

  describe("static from()", () => {
    test("should create a new instance from a table context", () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id")
        .build();

      const builder = DeleteBuilder.from(mockClient, table);
      expect(builder).toBeInstanceOf(DeleteBuilder);
    });

    test("should preserve table context", () => {
      const table = CreateTableBuilder.create(mockClient)
        .keyspace("test")
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
        })
        .primaryKey("id")
        .build();

      const builder = DeleteBuilder.from(mockClient, table);
      expect(builder).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------

  describe("full-row delete", () => {
    let usersTable: ReturnType<
      ReturnType<typeof CreateTableBuilder.create>["build"]
    >;

    beforeEach(() => {
      usersTable = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
          email: cql.scalar.text,
        })
        .primaryKey("id")
        .build();
    });

    it("should produce DELETE FROM without any column targets", () => {
      const cqlString = DeleteBuilder.from(mockClient, usersTable)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toMatch(/^DELETE FROM/);
    });

    it("should not list any columns between DELETE and FROM", () => {
      const cqlString = DeleteBuilder.from(mockClient, usersTable)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      // Everything between DELETE and FROM must be absent (no column names)
      expect(cqlString).not.toMatch(/DELETE \w+ FROM/);
    });
  });

  // -------------------------------------------------------------------------

  describe("column()", () => {
    let usersTable: ReturnType<
      ReturnType<typeof CreateTableBuilder.create>["build"]
    >;

    beforeEach(() => {
      usersTable = CreateTableBuilder.create(mockClient)
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

    it("should include the column name between DELETE and FROM", () => {
      const cqlString = DeleteBuilder.from(mockClient, usersTable)
        .column("email")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain("DELETE email FROM");
    });

    it("should support deleting multiple columns", () => {
      const cqlString = DeleteBuilder.from(mockClient, usersTable)
        .column("email")
        .column("age")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain("email");
      expect(cqlString).toContain("age");
      expect(cqlString.indexOf("DELETE")).toBeLessThan(
        cqlString.indexOf("FROM"),
      );
    });

    it("should produce comma-separated targets for multiple column() calls", () => {
      const cqlString = DeleteBuilder.from(mockClient, usersTable)
        .column("name")
        .column("email")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toMatch(/DELETE name, email FROM/);
    });
  });

  // -------------------------------------------------------------------------

  describe("field()", () => {
    let eventsTable: ReturnType<
      ReturnType<typeof CreateTableBuilder.create>["build"]
    >;

    beforeEach(() => {
      const address = cql.frozen(
        // Represent UDT as a frozen map for test purposes
        cql.map(cql.scalar.text, cql.scalar.text),
      );

      eventsTable = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          id: cql.scalar.uuid,
          address,
        })
        .primaryKey("id")
        .build();
    });

    it("should produce a col.field deletion target", () => {
      const cqlString = DeleteBuilder.from(mockClient, eventsTable)
        .field("address", "street")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain("address.street");
    });
  });

  // -------------------------------------------------------------------------

  describe("index()", () => {
    const eventsTable = CreateTableBuilder.create(mockClient)
      .table("events")
      .schema({
        id: cql.scalar.uuid,
        meta: cql.map(cql.scalar.text, cql.scalar.text),
      })
      .primaryKey("id")
      .build();

    it("should produce a col[?] deletion target", () => {
      const cqlString = DeleteBuilder.from(mockClient, eventsTable)
        .index("meta", "some-key")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain("meta[?]");
    });

    it("should place the map key value before the WHERE values in params", async () => {
      const context = DeleteBuilder.from(mockClient, eventsTable)
        .index("meta", "my-key")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .build();

      await context.execute();

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.any(String),
        ["my-key", "123e4567-e89b-12d3-a456-426614174000"],
        { prepare: true },
      );
    });
  });

  // -------------------------------------------------------------------------

  describe("where()", () => {
    let usersTable: ReturnType<
      ReturnType<typeof CreateTableBuilder.create>["build"]
    >;

    beforeEach(() => {
      usersTable = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
        })
        .primaryKey("id")
        .build();
    });

    it("should produce a WHERE clause", () => {
      const cqlString = DeleteBuilder.from(mockClient, usersTable)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain("WHERE id = ?");
    });

    it("should support chaining multiple where() conditions", () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          tenant_id: cql.scalar.text,
          event_id: cql.scalar.uuid,
          data: cql.scalar.text,
        })
        .primaryKey("tenant_id", "event_id")
        .build();

      const cqlString = DeleteBuilder.from(mockClient, table)
        .where("tenant_id", "=", "acme")
        .where("event_id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain("WHERE tenant_id = ? AND event_id = ?");
    });

    it("should preserve condition order", () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          tenant_id: cql.scalar.text,
          event_id: cql.scalar.uuid,
          data: cql.scalar.text,
        })
        .primaryKey("tenant_id", "event_id")
        .build();

      const cqlString = DeleteBuilder.from(mockClient, table)
        .where("tenant_id", "=", "t1")
        .where("event_id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      const whereIdx = cqlString.indexOf("WHERE");
      expect(cqlString.indexOf("tenant_id", whereIdx)).toBeLessThan(
        cqlString.indexOf("event_id", whereIdx),
      );
    });
  });

  // -------------------------------------------------------------------------

  describe("ifExists()", () => {
    let usersTable: ReturnType<
      ReturnType<typeof CreateTableBuilder.create>["build"]
    >;

    beforeEach(() => {
      usersTable = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
        })
        .primaryKey("id")
        .build();
    });

    it("should add IF EXISTS clause when called without arguments", () => {
      const builder = DeleteBuilder.from(mockClient, usersTable)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .ifExists();

      expect(builder.toCQL()).toContain("IF EXISTS");
    });

    it("should add IF EXISTS clause when called with true", () => {
      const builder = DeleteBuilder.from(mockClient, usersTable)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .ifExists(true);

      expect(builder.toCQL()).toContain("IF EXISTS");
    });

    it("should not add IF EXISTS clause when called with false", () => {
      const builder = DeleteBuilder.from(mockClient, usersTable)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .ifExists(false);

      expect(builder.toCQL()).not.toContain("IF EXISTS");
    });
  });

  // -------------------------------------------------------------------------

  describe("if()", () => {
    let usersTable: ReturnType<
      ReturnType<typeof CreateTableBuilder.create>["build"]
    >;

    beforeEach(() => {
      usersTable = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
          age: cql.scalar.int,
        })
        .primaryKey("id")
        .build();
    });

    it("should add an IF condition clause", () => {
      const cqlString = DeleteBuilder.from(mockClient, usersTable)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .if("name", "=", "Alice")
        .toCQL();

      expect(cqlString).toContain("IF name = ?");
    });

    it("should not include IF EXISTS when an IF condition is set", () => {
      const cqlString = DeleteBuilder.from(mockClient, usersTable)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .if("name", "=", "Alice")
        .toCQL();

      expect(cqlString).not.toContain("IF EXISTS");
    });
  });

  // -------------------------------------------------------------------------

  describe("timestamp()", () => {
    let usersTable: ReturnType<
      ReturnType<typeof CreateTableBuilder.create>["build"]
    >;

    beforeEach(() => {
      usersTable = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          id: cql.scalar.uuid,
          data: cql.scalar.text,
        })
        .primaryKey("id")
        .build();
    });

    it("should add USING TIMESTAMP option", () => {
      const timestamp = 1234567890123456;
      const cqlString = DeleteBuilder.from(mockClient, usersTable)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .timestamp(timestamp)
        .toCQL();

      expect(cqlString).toContain(`USING TIMESTAMP ${timestamp}`);
    });

    it("should place USING TIMESTAMP before WHERE", () => {
      const cqlString = DeleteBuilder.from(mockClient, usersTable)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .timestamp(1234567890123456)
        .toCQL();

      expect(cqlString.indexOf("USING TIMESTAMP")).toBeLessThan(
        cqlString.indexOf("WHERE"),
      );
    });

    it("should handle specific timestamp values", () => {
      const specificTime = 1234567890123456;
      const cqlString = DeleteBuilder.from(mockClient, usersTable)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .timestamp(specificTime)
        .toCQL();

      expect(cqlString).toContain(`USING TIMESTAMP ${specificTime}`);
    });
  });

  // -------------------------------------------------------------------------

  describe("toCQL()", () => {
    let usersTable: ReturnType<
      ReturnType<typeof CreateTableBuilder.create>["build"]
    >;

    beforeEach(() => {
      usersTable = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
          email: cql.scalar.text,
        })
        .primaryKey("id")
        .build();
    });

    it("should generate a basic DELETE statement", () => {
      const cqlString = DeleteBuilder.from(mockClient, usersTable)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toMatch(/^DELETE/);
      expect(cqlString).toContain("FROM");
      expect(cqlString).toContain("users");
      expect(cqlString).toContain("WHERE");
      expect(cqlString).toMatch(/;$/);
    });

    it("should include keyspace when present", () => {
      const table = CreateTableBuilder.create(mockClient)
        .keyspace("app")
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
        })
        .primaryKey("id")
        .build();

      const cqlString = DeleteBuilder.from(mockClient, table)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain("FROM app.users");
    });

    it("should put FROM before WHERE", () => {
      const cqlString = DeleteBuilder.from(mockClient, usersTable)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString.indexOf("FROM")).toBeLessThan(
        cqlString.indexOf("WHERE"),
      );
    });

    it("should use ? placeholders for WHERE values", () => {
      const cqlString = DeleteBuilder.from(mockClient, usersTable)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain("id = ?");
    });
  });

  // -------------------------------------------------------------------------

  describe("build()", () => {
    const usersTable = CreateTableBuilder.create(mockClient)
      .table("users")
      .schema({
        id: cql.scalar.uuid,
        name: cql.scalar.text,
      })
      .primaryKey("id")
      .build();

    it("should return a DeleteContext instance", () => {
      const context = DeleteBuilder.from(mockClient, usersTable)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .build();

      expect(context).toBeInstanceOf(DeleteContext);
    });

    it("should generate the same CQL from context as from builder", () => {
      const builder = DeleteBuilder.from(mockClient, usersTable).where(
        "id",
        "=",
        "123e4567-e89b-12d3-a456-426614174000",
      );

      expect(builder.build().toCQL()).toBe(builder.toCQL());
    });
  });

  // -------------------------------------------------------------------------

  describe("DeleteContext", () => {
    const usersTable = CreateTableBuilder.create(mockClient)
      .table("users")
      .schema({
        id: cql.scalar.uuid,
        name: cql.scalar.text,
        email: cql.scalar.text,
      })
      .primaryKey("id")
      .build();

    describe("execute()", () => {
      it("should execute the DELETE statement with a prepared statement", async () => {
        const context = DeleteBuilder.from(mockClient, usersTable)
          .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
          .build();

        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          expect.stringContaining("DELETE"),
          expect.any(Array),
          { prepare: true },
        );
      });

      it("should pass WHERE values in the params array", async () => {
        const context = DeleteBuilder.from(mockClient, usersTable)
          .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
          .build();

        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          expect.any(String),
          ["123e4567-e89b-12d3-a456-426614174000"],
          { prepare: true },
        );
      });

      it("should include IF condition values after WHERE values", async () => {
        const context = DeleteBuilder.from(mockClient, usersTable)
          .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
          .if("name", "=", "Alice")
          .build();

        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          expect.any(String),
          ["123e4567-e89b-12d3-a456-426614174000", "Alice"],
          { prepare: true },
        );
      });

      it("should handle execution errors", async () => {
        const errorClient = {
          execute: vi.fn().mockRejectedValue(new Error("Delete failed")),
        } as unknown as Client;

        const table = CreateTableBuilder.create(errorClient)
          .table("users")
          .schema({ id: cql.scalar.uuid })
          .primaryKey("id")
          .build();

        const context = DeleteBuilder.from(errorClient, table)
          .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
          .build();

        await expect(context.execute()).rejects.toThrow("Delete failed");
      });
    });

    describe("toCQL()", () => {
      it("should return the CQL statement", () => {
        const context = DeleteBuilder.from(mockClient, usersTable)
          .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
          .build();

        expect(context.toCQL()).toContain("DELETE");
        expect(context.toCQL()).toContain("users");
      });
    });
  });

  // -------------------------------------------------------------------------

  describe("method chaining", () => {
    const usersTable = CreateTableBuilder.create(mockClient)
      .table("users")
      .schema({
        id: cql.scalar.uuid,
        name: cql.scalar.text,
      })
      .primaryKey("id")
      .build();

    it("should allow chaining all methods", () => {
      expect(() => {
        DeleteBuilder.from(mockClient, usersTable)
          .column("name")
          .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
          .timestamp(Date.now() * 1000)
          .ifExists()
          .build();
      }).not.toThrow();
    });

    it("should maintain immutability through cloning", () => {
      const base = DeleteBuilder.from(mockClient, usersTable).where(
        "id",
        "=",
        "123e4567-e89b-12d3-a456-426614174000",
      );

      const withTimestamp = base.timestamp(1234567890123456);

      expect(base.toCQL()).not.toContain("USING TIMESTAMP");
      expect(withTimestamp.toCQL()).toContain(
        "USING TIMESTAMP 1234567890123456",
      );
    });
  });

  // -------------------------------------------------------------------------

  describe("real-world scenarios", () => {
    it("should delete a full user row", async () => {
      const table = CreateTableBuilder.create(mockClient)
        .keyspace("app")
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
          email: cql.scalar.text,
        })
        .primaryKey("id")
        .build();

      const context = DeleteBuilder.from(mockClient, table)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .build();

      await context.execute();

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.stringContaining("FROM app.users"),
        expect.any(Array),
        { prepare: true },
      );
    });

    it("should delete specific columns from a user row", async () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
          email: cql.scalar.text,
        })
        .primaryKey("id")
        .build();

      const context = DeleteBuilder.from(mockClient, table)
        .column("name")
        .column("email")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .build();

      expect(context.toCQL()).toMatch(/DELETE name, email FROM/);
    });

    it("should delete a row only if it exists", async () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("sessions")
        .schema({
          session_id: cql.scalar.uuid,
          token: cql.scalar.text,
        })
        .primaryKey("session_id")
        .build();

      const context = DeleteBuilder.from(mockClient, table)
        .where("session_id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .ifExists()
        .build();

      expect(context.toCQL()).toContain("IF EXISTS");
    });

    it("should delete a map entry by key", async () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          id: cql.scalar.uuid,
          meta: cql.map(cql.scalar.text, cql.scalar.text),
        })
        .primaryKey("id")
        .build();

      const context = DeleteBuilder.from(mockClient, table)
        .index("meta", "stale-key")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .build();

      expect(context.toCQL()).toContain("meta[?]");
    });

    it("should delete a row with a custom write timestamp", async () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          event_id: cql.scalar.uuid,
          data: cql.scalar.text,
        })
        .primaryKey("event_id")
        .build();

      const customTimestamp = 1234567890000000;
      const context = DeleteBuilder.from(mockClient, table)
        .where("event_id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .timestamp(customTimestamp)
        .build();

      expect(context.toCQL()).toContain(`USING TIMESTAMP ${customTimestamp}`);
    });

    it("should conditionally delete with an IF clause", async () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
          email: cql.scalar.text,
        })
        .primaryKey("id")
        .build();

      const context = DeleteBuilder.from(mockClient, table)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .if("email", "=", "alice@example.com")
        .build();

      expect(context.toCQL()).toContain("IF email = ?");
      expect(context.toCQL()).not.toContain("IF EXISTS");
    });
  });
});
