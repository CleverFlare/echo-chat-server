import { cql } from "../../cql-types";
import { InsertBuilder } from "./builder";
import { InsertContext } from "./context";
import { CreateTableBuilder } from "../create-table/builder";
import { describe, expect, it, test, vi, beforeEach } from "vitest";
import type { Client } from "cassandra-driver";

describe("InsertBuilder", () => {
  let mockClient: Client;

  beforeEach(() => {
    mockClient = {
      execute: vi.fn().mockResolvedValue({ rows: [] }),
    } as unknown as Client;
  });

  describe("static into()", () => {
    test("should create a new instance from a table context", () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("users")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id")
        .build();

      const builder = InsertBuilder.into(mockClient, table);
      expect(builder).toBeInstanceOf(InsertBuilder);
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

      const builder = InsertBuilder.into(mockClient, table);
      expect(builder).toBeDefined();
    });
  });

  describe("insert()", () => {
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

    it("should set values for insert", () => {
      const builder = InsertBuilder.into(mockClient, usersTable).insert({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Alice",
        email: "alice@example.com",
        age: 30,
      });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("INSERT INTO");
      expect(cqlString).toContain("VALUES");
    });

    it("should handle partial column insertion", () => {
      const builder = InsertBuilder.into(mockClient, usersTable).insert({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Bob",
      });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain('"id", "name"');
      expect(cqlString).not.toContain('"email"');
      expect(cqlString).not.toContain('"age"');
    });

    it("should generate correct number of parameterized values placeholders", () => {
      const builder = InsertBuilder.into(mockClient, usersTable).insert({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Charlie",
        email: "charlie@example.com",
      });

      const cqlString = builder.toCQL();
      const placeholderCount = (cqlString.match(/:(.*?)/g) || []).length;
      expect(placeholderCount).toBe(3);
    });
  });

  describe("ifNotExists()", () => {
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

    it("should add IF NOT EXISTS clause when true", () => {
      const builder = InsertBuilder.into(mockClient, usersTable)
        .insert({
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Alice",
        })
        .ifNotExists(true);

      expect(builder.toCQL()).toContain("IF NOT EXISTS");
    });

    it("should add IF NOT EXISTS clause when called without arguments", () => {
      const builder = InsertBuilder.into(mockClient, usersTable)
        .insert({
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Bob",
        })
        .ifNotExists();

      expect(builder.toCQL()).toContain("IF NOT EXISTS");
    });

    it("should not add IF NOT EXISTS clause when false", () => {
      const builder = InsertBuilder.into(mockClient, usersTable)
        .insert({
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Charlie",
        })
        .ifNotExists(false);

      expect(builder.toCQL()).not.toContain("IF NOT EXISTS");
    });
  });

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
      const builder = InsertBuilder.into(mockClient, usersTable)
        .insert({
          id: "123e4567-e89b-12d3-a456-426614174000",
          token: "abc123",
        })
        .ttl(3600);

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("USING TTL 3600");
    });

    it("should handle zero TTL", () => {
      const builder = InsertBuilder.into(mockClient, usersTable)
        .insert({
          id: "123e4567-e89b-12d3-a456-426614174000",
          token: "xyz789",
        })
        .ttl(0);

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("USING TTL 0");
    });

    it("should handle large TTL values", () => {
      const builder = InsertBuilder.into(mockClient, usersTable)
        .insert({
          id: "123e4567-e89b-12d3-a456-426614174000",
          token: "token",
        })
        .ttl(86400 * 365);

      const cqlString = builder.toCQL();
      expect(cqlString).toContain(`USING TTL ${86400 * 365}`);
    });
  });

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
      const builder = InsertBuilder.into(mockClient, usersTable)
        .insert({
          id: "123e4567-e89b-12d3-a456-426614174000",
          data: "test",
        })
        .timestamp(timestamp);

      const cqlString = builder.toCQL();
      expect(cqlString).toContain(`USING TIMESTAMP ${timestamp}`);
    });

    it("should handle specific timestamp values", () => {
      const specificTime = 1234567890123456;
      const builder = InsertBuilder.into(mockClient, usersTable)
        .insert({
          id: "123e4567-e89b-12d3-a456-426614174000",
          data: "historical",
        })
        .timestamp(specificTime);

      const cqlString = builder.toCQL();
      expect(cqlString).toContain(`USING TIMESTAMP ${specificTime}`);
    });
  });

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
      const builder = InsertBuilder.into(mockClient, usersTable)
        .insert({
          id: "123e4567-e89b-12d3-a456-426614174000",
          value: "test",
        })
        .ttl(3600)
        .timestamp(timestamp);

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("USING TTL 3600 AND TIMESTAMP");
    });

    it("should combine IF NOT EXISTS with TTL", () => {
      const builder = InsertBuilder.into(mockClient, usersTable)
        .insert({
          id: "123e4567-e89b-12d3-a456-426614174000",
          value: "test",
        })
        .ifNotExists()
        .ttl(7200);

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("IF NOT EXISTS");
      expect(cqlString).toContain("USING TTL 7200");
    });

    it("should combine all options", () => {
      const timestamp = Date.now() * 1000;
      const builder = InsertBuilder.into(mockClient, usersTable)
        .insert({
          id: "123e4567-e89b-12d3-a456-426614174000",
          value: "complete",
        })
        .ifNotExists()
        .ttl(1800)
        .timestamp(timestamp);

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("IF NOT EXISTS");
      expect(cqlString).toContain("USING TTL 1800 AND TIMESTAMP");
    });
  });

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

    it("should generate basic INSERT statement", () => {
      const builder = InsertBuilder.into(mockClient, usersTable).insert({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Alice",
        email: "alice@example.com",
      });

      const cqlString = builder.toCQL();
      expect(cqlString).toMatch(/^INSERT INTO/);
      expect(cqlString).toContain('"users"');
      expect(cqlString).toContain("VALUES");
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

      const builder = InsertBuilder.into(mockClient, table).insert({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Bob",
      });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain('INSERT INTO "app"."users"');
    });

    it("should list columns in parentheses", () => {
      const builder = InsertBuilder.into(mockClient, usersTable).insert({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Charlie",
      });

      const cqlString = builder.toCQL();
      expect(cqlString).toMatch(/\("id", "name"\) VALUES \(:(.*?), :(.*?)\)/);
    });

    it("should use parameterized placeholders for values", () => {
      const builder = InsertBuilder.into(mockClient, usersTable).insert({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Dave",
        email: "dave@example.com",
      });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("VALUES (:id, :name, :email)");
    });
  });

  describe("build()", () => {
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

    it("should return an InsertContext instance", () => {
      const builder = InsertBuilder.into(mockClient, usersTable).insert({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Alice",
      });

      const context = builder.build();
      expect(context).toBeInstanceOf(InsertContext);
    });

    it("should generate the same CQL from context", () => {
      const builder = InsertBuilder.into(mockClient, usersTable).insert({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Bob",
      });

      const builderCQL = builder.toCQL();
      const context = builder.build();
      const contextCQL = context.toCQL();

      expect(contextCQL).toBe(builderCQL);
    });
  });

  describe("InsertContext", () => {
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

    describe("execute()", () => {
      it("should execute the INSERT statement with prepared statement", async () => {
        const builder = InsertBuilder.into(mockClient, usersTable).insert({
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Alice",
          email: "alice@example.com",
        });

        const context = builder.build();
        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO "users"'),
          expect.objectContaining({
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "Alice",
            email: "alice@example.com",
          }),
          { prepare: true },
        );
      });

      it("should pass values in correct order", async () => {
        const builder = InsertBuilder.into(mockClient, usersTable).insert({
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Bob",
        });

        const context = builder.build();
        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          expect.any(String),
          { id: "123e4567-e89b-12d3-a456-426614174000", name: "Bob" },
          { prepare: true },
        );
      });

      it("should handle execution errors", async () => {
        const errorClient = {
          execute: vi.fn().mockRejectedValue(new Error("Insert failed")),
        } as unknown as Client;

        const table = CreateTableBuilder.create(errorClient)
          .table("users")
          .schema({ id: cql.scalar.uuid })
          .primaryKey("id")
          .build();

        const builder = InsertBuilder.into(errorClient, table).insert({
          id: "123e4567-e89b-12d3-a456-426614174000",
        });

        const context = builder.build();

        await expect(context.execute()).rejects.toThrow("Insert failed");
      });
    });

    describe("toCQL()", () => {
      it("should return the CQL statement", () => {
        const builder = InsertBuilder.into(mockClient, usersTable).insert({
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Alice",
        });

        const context = builder.build();
        const cqlString = context.toCQL();

        expect(cqlString).toContain("INSERT INTO");
        expect(cqlString).toContain('"users"');
      });
    });
  });

  describe("method chaining", () => {
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

    it("should allow chaining all methods", () => {
      expect(() => {
        InsertBuilder.into(mockClient, usersTable)
          .insert({
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "Alice",
          })
          .ifNotExists()
          .ttl(3600)
          .timestamp(Date.now() * 1000)
          .build();
      }).not.toThrow();
    });

    it("should maintain immutability through cloning", () => {
      const base = InsertBuilder.into(mockClient, usersTable).insert({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Alice",
      });

      const withTTL = base.ttl(3600);

      expect(base.toCQL()).not.toContain("USING TTL");
      expect(withTTL.toCQL()).toContain("USING TTL 3600");
    });
  });

  describe("edge cases", () => {
    it("should handle single column insert", () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("simple")
        .schema({ id: cql.scalar.uuid })
        .primaryKey("id")
        .build();

      const builder = InsertBuilder.into(mockClient, table).insert({
        id: "123e4567-e89b-12d3-a456-426614174000",
      });

      expect(builder.toCQL()).toContain('("id") VALUES (:id)');
    });

    it("should handle many columns", () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("large")
        .schema({
          col1: cql.scalar.text,
          col2: cql.scalar.text,
          col3: cql.scalar.text,
          col4: cql.scalar.text,
          col5: cql.scalar.text,
        })
        .primaryKey("col1")
        .build();

      const builder = InsertBuilder.into(mockClient, table).insert({
        col1: "a",
        col2: "b",
        col3: "c",
        col4: "d",
        col5: "e",
      });

      const placeholderCount = (builder.toCQL().match(/:(.*?)/g) || []).length;
      expect(placeholderCount).toBe(5);
    });
  });

  describe("real-world scenarios", () => {
    it("should insert a new user", async () => {
      const table = CreateTableBuilder.create(mockClient)
        .keyspace("app")
        .table("users")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
          email: cql.scalar.text,
          createdAt: cql.scalar.timestamp,
        })
        .primaryKey("id")
        .build();

      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const context = InsertBuilder.into(mockClient, table)
        .insert({
          id: userId,
          name: "Alice Johnson",
          email: "alice@example.com",
          createdAt: new Date(),
        })
        .build();

      await context.execute();

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.stringContaining('"app"."users"'),
        expect.any(Object),
        { prepare: true },
      );
    });

    it("should insert a session with TTL", async () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("sessions")
        .schema({
          sessionId: cql.scalar.uuid,
          userId: cql.scalar.uuid,
          token: cql.scalar.text,
        })
        .primaryKey("sessionId")
        .build();

      const context = InsertBuilder.into(mockClient, table)
        .insert({
          sessionId: "123e4567-e89b-12d3-a456-426614174000",
          userId: "223e4567-e89b-12d3-a456-426614174000",
          token: "abc123xyz",
        })
        .ttl(3600)
        .build();

      expect(context.toCQL()).toContain("USING TTL 3600");
    });

    it("should insert event data with custom timestamp", async () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("events")
        .schema({
          eventId: cql.scalar.uuid,
          eventType: cql.scalar.text,
          data: cql.scalar.text,
        })
        .primaryKey("eventId")
        .build();

      const customTimestamp = 1234567890000000;
      const context = InsertBuilder.into(mockClient, table)
        .insert({
          eventId: "123e4567-e89b-12d3-a456-426614174000",
          eventType: "login",
          data: '{"ip": "192.168.1.1"}',
        })
        .timestamp(customTimestamp)
        .build();

      expect(context.toCQL()).toContain(`USING TIMESTAMP ${customTimestamp}`);
    });

    it("should conditionally insert with IF NOT EXISTS", async () => {
      const table = CreateTableBuilder.create(mockClient)
        .table("uniqueUsernames")
        .schema({
          username: cql.scalar.text,
          userId: cql.scalar.uuid,
        })
        .primaryKey("username")
        .build();

      const context = InsertBuilder.into(mockClient, table)
        .insert({
          username: "alice",
          userId: "123e4567-e89b-12d3-a456-426614174000",
        })
        .ifNotExists()
        .build();

      expect(context.toCQL()).toContain("IF NOT EXISTS");
    });
  });
});
