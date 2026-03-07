import { cql } from "../../cql-types";
import { UpdateBuilder } from "./builder";
import { UpdateContext } from "./context";
import { CreateTableBuilder } from "../create-table/builder";
import { describe, expect, it, test, vi, beforeEach } from "vitest";
import type { Client } from "cassandra-driver";

describe("UpdateBuilder", () => {
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

      const builder = UpdateBuilder.from(mockClient, table);
      expect(builder).toBeInstanceOf(UpdateBuilder);
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

      const builder = UpdateBuilder.from(mockClient, table);
      expect(builder).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------

  describe("set()", () => {
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

    it("should produce a SET clause for a scalar column", () => {
      const builder = UpdateBuilder.from(mockClient, usersTable)
        .set("email", "new@example.com")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000");

      expect(builder.toCQL()).toContain('"email" = ?');
    });

    it("should allow chaining multiple set() calls", () => {
      const cqlString = UpdateBuilder.from(mockClient, usersTable)
        .set("email", "a@b.com")
        .set("age", 30)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain('"email" = ?');
      expect(cqlString).toContain('"age" = ?');
    });

    it("should produce comma-separated assignments for multiple set() calls", () => {
      const cqlString = UpdateBuilder.from(mockClient, usersTable)
        .set("name", "Alice")
        .set("email", "alice@example.com")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toMatch(/"name" = \?.*,.*"email" = \?/);
    });
  });

  // -------------------------------------------------------------------------

  describe("append()", () => {
    let eventsTable: ReturnType<
      ReturnType<typeof CreateTableBuilder.create>["build"]
    >;

    beforeEach(() => {
      eventsTable = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          id: cql.scalar.uuid,
          tags: cql.list(cql.scalar.text),
          scores: cql.set(cql.scalar.int),
          meta: cql.map(cql.scalar.text, cql.scalar.text),
        })
        .primaryKey("id")
        .build();
    });

    it("should produce a column = column + ? pattern for lists", () => {
      const cqlString = UpdateBuilder.from(mockClient, eventsTable)
        .append("tags", ["admin"])
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain('"tags" = "tags" + ?');
    });

    it("should produce a column = column + ? pattern for sets", () => {
      const cqlString = UpdateBuilder.from(mockClient, eventsTable)
        .append("scores", new Set([1, 2, 3]))
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain('"scores" = "scores" + ?');
    });

    it("should produce a column = column + ? pattern for maps", () => {
      const cqlString = UpdateBuilder.from(mockClient, eventsTable)
        .append("meta", { key: "value" })
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain('"meta" = "meta" + ?');
    });
  });

  // -------------------------------------------------------------------------

  describe("prepend()", () => {
    let eventsTable: ReturnType<
      ReturnType<typeof CreateTableBuilder.create>["build"]
    >;

    beforeEach(() => {
      eventsTable = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          id: cql.scalar.uuid,
          tags: cql.list(cql.scalar.text),
        })
        .primaryKey("id")
        .build();
    });

    it("should produce a column = ? + column pattern", () => {
      const cqlString = UpdateBuilder.from(mockClient, eventsTable)
        .prepend("tags", ["first"])
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain('"tags" = ? + "tags"');
    });
  });

  // -------------------------------------------------------------------------

  describe("remove()", () => {
    let eventsTable: ReturnType<
      ReturnType<typeof CreateTableBuilder.create>["build"]
    >;

    beforeEach(() => {
      eventsTable = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          id: cql.scalar.uuid,
          tags: cql.list(cql.scalar.text),
          scores: cql.set(cql.scalar.int),
          meta: cql.map(cql.scalar.text, cql.scalar.text),
        })
        .primaryKey("id")
        .build();
    });

    it("should produce a column = column - ? pattern for lists", () => {
      const cqlString = UpdateBuilder.from(mockClient, eventsTable)
        .remove("tags", ["old"])
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain('"tags" = "tags" - ?');
    });

    it("should produce a column = column - ? pattern for sets", () => {
      const cqlString = UpdateBuilder.from(mockClient, eventsTable)
        .remove("scores", new Set([99]))
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain('"scores" = "scores" - ?');
    });

    it("should produce a column = column - ? pattern for maps", () => {
      const cqlString = UpdateBuilder.from(mockClient, eventsTable)
        .remove("meta", { obsolete: "key" })
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain('"meta" = "meta" - ?');
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
      const cqlString = UpdateBuilder.from(mockClient, usersTable)
        .set("name", "Alice")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain('WHERE "id" = ?');
    });

    it("should support chaining multiple where() conditions", () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          tenantId: cql.scalar.text,
          eventId: cql.scalar.uuid,
          data: cql.scalar.text,
        })
        .primaryKey("tenantId", "eventId")
        .build();

      const cqlString = UpdateBuilder.from(mockClient, table)
        .set("data", "payload")
        .where("tenantId", "=", "acme")
        .where("eventId", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain('WHERE "tenantId" = ? AND "eventId" = ?');
    });

    it("should preserve condition order", () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          tenantId: cql.scalar.text,
          eventId: cql.scalar.uuid,
          data: cql.scalar.text,
        })
        .primaryKey("tenantId", "eventId")
        .build();

      const cqlString = UpdateBuilder.from(mockClient, table)
        .set("data", "x")
        .where("tenantId", "=", "t1")
        .where("eventId", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      const whereIdx = cqlString.indexOf("WHERE");
      const tenantIdx = cqlString.indexOf('"tenantId"', whereIdx);
      const eventIdx = cqlString.indexOf('"eventId"', whereIdx);
      expect(tenantIdx).toBeLessThan(eventIdx);
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
      const builder = UpdateBuilder.from(mockClient, usersTable)
        .set("name", "Alice")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .ifExists();

      expect(builder.toCQL()).toContain("IF EXISTS");
    });

    it("should add IF EXISTS clause when called with true", () => {
      const builder = UpdateBuilder.from(mockClient, usersTable)
        .set("name", "Alice")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .ifExists(true);

      expect(builder.toCQL()).toContain("IF EXISTS");
    });

    it("should not add IF EXISTS clause when called with false", () => {
      const builder = UpdateBuilder.from(mockClient, usersTable)
        .set("name", "Alice")
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
          email: cql.scalar.text,
          age: cql.scalar.int,
        })
        .primaryKey("id")
        .build();
    });

    it("should add an IF condition clause", () => {
      const cqlString = UpdateBuilder.from(mockClient, usersTable)
        .set("age", 31)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .if("email", "=", "old@example.com")
        .toCQL();

      expect(cqlString).toContain('IF "email" = ?');
    });

    it("should not include IF EXISTS when an IF condition is set", () => {
      const cqlString = UpdateBuilder.from(mockClient, usersTable)
        .set("age", 31)
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .if("email", "=", "old@example.com")
        .toCQL();

      expect(cqlString).not.toContain("IF EXISTS");
    });
  });

  // -------------------------------------------------------------------------

  describe("ttl()", () => {
    let usersTable: ReturnType<
      ReturnType<typeof CreateTableBuilder.create>["build"]
    >;

    beforeEach(() => {
      usersTable = CreateTableBuilder.create(mockClient)
        .table("sessions")
        .schema({
          id: cql.scalar.uuid,
          token: cql.scalar.text,
        })
        .primaryKey("id")
        .build();
    });

    it("should add TTL option", () => {
      const cqlString = UpdateBuilder.from(mockClient, usersTable)
        .set("token", "abc123")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .ttl(3600)
        .toCQL();

      expect(cqlString).toContain("USING TTL 3600");
    });

    it("should handle zero TTL", () => {
      const cqlString = UpdateBuilder.from(mockClient, usersTable)
        .set("token", "abc123")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .ttl(0)
        .toCQL();

      expect(cqlString).toContain("USING TTL 0");
    });

    it("should handle large TTL values", () => {
      const cqlString = UpdateBuilder.from(mockClient, usersTable)
        .set("token", "abc123")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .ttl(86400 * 365)
        .toCQL();

      expect(cqlString).toContain(`USING TTL ${86400 * 365}`);
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

    it("should add TIMESTAMP option", () => {
      const timestamp = Date.now() * 1000;
      const cqlString = UpdateBuilder.from(mockClient, usersTable)
        .set("data", "test")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .timestamp(timestamp)
        .toCQL();

      expect(cqlString).toContain(`USING TIMESTAMP ${timestamp}`);
    });

    it("should handle specific timestamp values", () => {
      const specificTime = 1234567890123456;
      const cqlString = UpdateBuilder.from(mockClient, usersTable)
        .set("data", "historical")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .timestamp(specificTime)
        .toCQL();

      expect(cqlString).toContain(`USING TIMESTAMP ${specificTime}`);
    });
  });

  // -------------------------------------------------------------------------

  describe("combined options", () => {
    let usersTable: ReturnType<
      ReturnType<typeof CreateTableBuilder.create>["build"]
    >;

    beforeEach(() => {
      usersTable = CreateTableBuilder.create(mockClient)
        .table("data")
        .schema({
          id: cql.scalar.uuid,
          value: cql.scalar.text,
        })
        .primaryKey("id")
        .build();
    });

    it("should combine TTL and TIMESTAMP", () => {
      const timestamp = Date.now() * 1000;
      const cqlString = UpdateBuilder.from(mockClient, usersTable)
        .set("value", "test")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .ttl(3600)
        .timestamp(timestamp)
        .toCQL();

      expect(cqlString).toContain("USING TTL 3600 AND TIMESTAMP");
    });

    it("should combine IF EXISTS with TTL", () => {
      const cqlString = UpdateBuilder.from(mockClient, usersTable)
        .set("value", "test")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .ttl(7200)
        .ifExists()
        .toCQL();

      expect(cqlString).toContain("USING TTL 7200");
      expect(cqlString).toContain("IF EXISTS");
    });

    it("should combine all options", () => {
      const timestamp = Date.now() * 1000;
      const cqlString = UpdateBuilder.from(mockClient, usersTable)
        .set("value", "complete")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .ttl(1800)
        .timestamp(timestamp)
        .ifExists()
        .toCQL();

      expect(cqlString).toContain("IF EXISTS");
      expect(cqlString).toContain("USING TTL 1800 AND TIMESTAMP");
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

    it("should generate a basic UPDATE statement", () => {
      const cqlString = UpdateBuilder.from(mockClient, usersTable)
        .set("name", "Alice")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toMatch(/^UPDATE/);
      expect(cqlString).toContain('"users"');
      expect(cqlString).toContain("SET");
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

      const cqlString = UpdateBuilder.from(mockClient, table)
        .set("name", "Bob")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain('UPDATE "app"."users"');
    });

    it("should put SET before WHERE", () => {
      const cqlString = UpdateBuilder.from(mockClient, usersTable)
        .set("name", "Charlie")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString.indexOf("SET")).toBeLessThan(cqlString.indexOf("WHERE"));
    });

    it("should use ? placeholders for values", () => {
      const cqlString = UpdateBuilder.from(mockClient, usersTable)
        .set("name", "Dave")
        .set("email", "dave@example.com")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .toCQL();

      expect(cqlString).toContain('"name" = ?');
      expect(cqlString).toContain('"email" = ?');
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

    it("should return an UpdateContext instance", () => {
      const context = UpdateBuilder.from(mockClient, usersTable)
        .set("name", "Alice")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .build();

      expect(context).toBeInstanceOf(UpdateContext);
    });

    it("should generate the same CQL from context as from builder", () => {
      const builder = UpdateBuilder.from(mockClient, usersTable)
        .set("name", "Bob")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000");

      expect(builder.build().toCQL()).toBe(builder.toCQL());
    });
  });

  // -------------------------------------------------------------------------

  describe("UpdateContext", () => {
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
      it("should execute the UPDATE statement with a prepared statement", async () => {
        const context = UpdateBuilder.from(mockClient, usersTable)
          .set("name", "Alice")
          .set("email", "alice@example.com")
          .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
          .build();

        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE "users"'),
          expect.any(Array),
          { prepare: true },
        );
      });

      it("should pass update values before where values in the params array", async () => {
        const context = UpdateBuilder.from(mockClient, usersTable)
          .set("name", "Bob")
          .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
          .build();

        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          expect.any(String),
          ["Bob", "123e4567-e89b-12d3-a456-426614174000"],
          { prepare: true },
        );
      });

      it("should include IF condition values after where values", async () => {
        const context = UpdateBuilder.from(mockClient, usersTable)
          .set("name", "Charlie")
          .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
          .if("email", "=", "old@example.com")
          .build();

        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          expect.any(String),
          [
            "Charlie",
            "123e4567-e89b-12d3-a456-426614174000",
            "old@example.com",
          ],
          { prepare: true },
        );
      });

      it("should handle execution errors", async () => {
        const errorClient = {
          execute: vi.fn().mockRejectedValue(new Error("Update failed")),
        } as unknown as Client;

        const table = CreateTableBuilder.create(errorClient)
          .table("users")
          .schema({ id: cql.scalar.uuid, name: cql.scalar.text })
          .primaryKey("id")
          .build();

        const context = UpdateBuilder.from(errorClient, table)
          .set("name", "Dave")
          .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
          .build();

        await expect(context.execute()).rejects.toThrow("Update failed");
      });
    });

    describe("toCQL()", () => {
      it("should return the CQL statement", () => {
        const context = UpdateBuilder.from(mockClient, usersTable)
          .set("name", "Alice")
          .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
          .build();

        expect(context.toCQL()).toContain("UPDATE");
        expect(context.toCQL()).toContain('"users"');
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
        UpdateBuilder.from(mockClient, usersTable)
          .set("name", "Alice")
          .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
          .ttl(3600)
          .timestamp(Date.now() * 1000)
          .ifExists()
          .build();
      }).not.toThrow();
    });

    it("should maintain immutability through cloning", () => {
      const base = UpdateBuilder.from(mockClient, usersTable)
        .set("name", "Alice")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000");

      const withTTL = base.ttl(3600);

      expect(base.toCQL()).not.toContain("USING TTL");
      expect(withTTL.toCQL()).toContain("USING TTL 3600");
    });
  });

  // -------------------------------------------------------------------------

  describe("real-world scenarios", () => {
    it("should update a user's profile", async () => {
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

      const context = UpdateBuilder.from(mockClient, table)
        .set("name", "Alice Johnson")
        .set("email", "alice@example.com")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .build();

      await context.execute();

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE "app"."users"'),
        expect.any(Array),
        { prepare: true },
      );
    });

    it("should update a session token with TTL", async () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("sessions")
        .schema({
          sessionId: cql.scalar.uuid,
          token: cql.scalar.text,
        })
        .primaryKey("sessionId")
        .build();

      const context = UpdateBuilder.from(mockClient, table)
        .set("token", "new-token-xyz")
        .where("sessionId", "=", "123e4567-e89b-12d3-a456-426614174000")
        .ttl(3600)
        .build();

      expect(context.toCQL()).toContain("USING TTL 3600");
    });

    it("should update an event with a custom timestamp", async () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          eventId: cql.scalar.uuid,
          data: cql.scalar.text,
        })
        .primaryKey("eventId")
        .build();

      const customTimestamp = 1234567890000000;
      const context = UpdateBuilder.from(mockClient, table)
        .set("data", '{"status": "processed"}')
        .where("eventId", "=", "123e4567-e89b-12d3-a456-426614174000")
        .timestamp(customTimestamp)
        .build();

      expect(context.toCQL()).toContain(`USING TIMESTAMP ${customTimestamp}`);
    });

    it("should conditionally update with IF EXISTS", async () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
        })
        .primaryKey("id")
        .build();

      const context = UpdateBuilder.from(mockClient, table)
        .set("name", "Updated Name")
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .ifExists()
        .build();

      expect(context.toCQL()).toContain("IF EXISTS");
    });

    it("should append tags to an event record", async () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          id: cql.scalar.uuid,
          tags: cql.list(cql.scalar.text),
        })
        .primaryKey("id")
        .build();

      const context = UpdateBuilder.from(mockClient, table)
        .append("tags", ["urgent", "reviewed"])
        .where("id", "=", "123e4567-e89b-12d3-a456-426614174000")
        .build();

      expect(context.toCQL()).toContain('"tags" = "tags" + ?');
    });
  });
});
