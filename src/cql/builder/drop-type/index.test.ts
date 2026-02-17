import { DropTypeBuilder } from "./builder";
import { DropTypeContext } from "./context";
import { describe, expect, it, test, vi, beforeEach } from "vitest";
import type { Client } from "cassandra-driver";

describe("DropTypeBuilder", () => {
  let mockClient: Client;

  beforeEach(() => {
    mockClient = {
      execute: vi.fn().mockResolvedValue({ rows: [] }),
    } as unknown as Client;
  });

  describe("static create()", () => {
    test("should create a new instance of DropTypeBuilder", () => {
      const builder = DropTypeBuilder.create(mockClient);
      expect(builder).toBeInstanceOf(DropTypeBuilder);
    });
  });

  describe("keyspace()", () => {
    it("should set the keyspace name", () => {
      const builder = DropTypeBuilder.create(mockClient)
        .keyspace("my_keyspace")
        .type("address");

      expect(builder.toCQL()).toContain("my_keyspace.address");
    });

    it("should handle various keyspace names", () => {
      const builder = DropTypeBuilder.create(mockClient)
        .keyspace("test_keyspace_123")
        .type("user_type");

      expect(builder.toCQL()).toContain("test_keyspace_123.user_type");
    });
  });

  describe("type()", () => {
    it("should set the type name", () => {
      const builder = DropTypeBuilder.create(mockClient).type("address");

      expect(builder.toCQL()).toContain("address");
    });

    it("should handle type names with underscores", () => {
      const builder =
        DropTypeBuilder.create(mockClient).type("user_profile_data");

      expect(builder.toCQL()).toContain("user_profile_data");
    });
  });

  describe("ifExists()", () => {
    it("should add IF EXISTS clause when true", () => {
      const builder = DropTypeBuilder.create(mockClient)
        .type("address")
        .ifExists(true);

      expect(builder.toCQL()).toContain("IF EXISTS");
    });

    it("should add IF EXISTS clause when called without arguments", () => {
      const builder = DropTypeBuilder.create(mockClient)
        .type("address")
        .ifExists();

      expect(builder.toCQL()).toContain("IF EXISTS");
    });

    it("should not add IF EXISTS clause when false", () => {
      const builder = DropTypeBuilder.create(mockClient)
        .type("address")
        .ifExists(false);

      expect(builder.toCQL()).not.toContain("IF EXISTS");
    });

    it("should position IF EXISTS correctly in CQL", () => {
      const builder = DropTypeBuilder.create(mockClient)
        .keyspace("test")
        .type("address")
        .ifExists();

      const cqlString = builder.toCQL();
      const ifExistsIndex = cqlString.indexOf("IF EXISTS");
      const typeIndex = cqlString.indexOf("test.address");
      expect(ifExistsIndex).toBeLessThan(typeIndex);
    });
  });

  describe("toCQL()", () => {
    it("should generate basic DROP TYPE statement", () => {
      const builder = DropTypeBuilder.create(mockClient).type("address");

      const cqlString = builder.toCQL();
      expect(cqlString).toMatch(/^DROP TYPE/);
      expect(cqlString).toContain("address");
      expect(cqlString).toMatch(/;$/);
    });

    it("should generate DROP TYPE with keyspace", () => {
      const builder = DropTypeBuilder.create(mockClient)
        .keyspace("test_keyspace")
        .type("address");

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("test_keyspace.address");
    });

    it("should generate DROP TYPE IF EXISTS", () => {
      const builder = DropTypeBuilder.create(mockClient)
        .type("address")
        .ifExists();

      const cqlString = builder.toCQL();
      expect(cqlString).toMatch(/DROP TYPE IF EXISTS/);
    });

    it("should generate complete CQL statement", () => {
      const builder = DropTypeBuilder.create(mockClient)
        .keyspace("my_keyspace")
        .type("full_address")
        .ifExists();

      const cqlString = builder.toCQL();
      expect(cqlString).toBe("DROP TYPE IF EXISTS my_keyspace.full_address;");
    });

    it("should generate type without keyspace", () => {
      const builder = DropTypeBuilder.create(mockClient).type("simple_type");

      const cqlString = builder.toCQL();
      expect(cqlString).toBe("DROP TYPE simple_type;");
      expect(cqlString).not.toContain(".");
    });

    it("should throw error when type name is missing", () => {
      // eslint-disable-next-line
      const builder = DropTypeBuilder.create(mockClient) as any;

      expect(() => builder.toCQL()).toThrow("Type name is required");
    });
  });

  describe("build()", () => {
    it("should return a DropTypeContext instance", () => {
      const builder = DropTypeBuilder.create(mockClient).type("address");

      const context = builder.build();
      expect(context).toBeInstanceOf(DropTypeContext);
    });

    it("should generate the same CQL from context", () => {
      const builder = DropTypeBuilder.create(mockClient)
        .keyspace("test")
        .type("address")
        .ifExists();

      const builderCQL = builder.toCQL();
      const context = builder.build();
      const contextCQL = context.toCQL();

      expect(contextCQL).toBe(builderCQL);
    });
  });

  describe("DropTypeContext", () => {
    describe("execute()", () => {
      it("should execute the DROP TYPE statement", async () => {
        const builder = DropTypeBuilder.create(mockClient).type("address");
        const context = builder.build();

        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          expect.stringContaining("DROP TYPE address"),
        );
      });

      it("should execute with keyspace", async () => {
        const builder = DropTypeBuilder.create(mockClient)
          .keyspace("test")
          .type("address");

        const context = builder.build();
        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          "DROP TYPE test.address;",
        );
      });

      it("should execute with IF EXISTS", async () => {
        const builder = DropTypeBuilder.create(mockClient)
          .type("address")
          .ifExists();

        const context = builder.build();
        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          "DROP TYPE IF EXISTS address;",
        );
      });

      it("should handle execution errors", async () => {
        const errorClient = {
          execute: vi.fn().mockRejectedValue(new Error("Execution failed")),
        } as unknown as Client;

        const builder = DropTypeBuilder.create(errorClient).type("address");
        const context = builder.build();

        await expect(context.execute()).rejects.toThrow("Execution failed");
      });
    });

    describe("toCQL()", () => {
      it("should return the CQL statement", () => {
        const builder = DropTypeBuilder.create(mockClient).type("address");
        const context = builder.build();

        const cqlString = context.toCQL();
        expect(cqlString).toContain("DROP TYPE");
        expect(cqlString).toContain("address");
      });
    });
  });

  describe("method chaining", () => {
    it("should allow chaining all methods", () => {
      expect(() => {
        DropTypeBuilder.create(mockClient)
          .keyspace("test")
          .type("address")
          .ifExists()
          .build();
      }).not.toThrow();
    });

    it("should allow type before keyspace", () => {
      expect(() => {
        DropTypeBuilder.create(mockClient)
          .type("address")
          .keyspace("test")
          .build();
      }).not.toThrow();
    });

    it("should maintain immutability through cloning", () => {
      const base = DropTypeBuilder.create(mockClient).type("address");
      const withKeyspace = base.keyspace("test");

      expect(base.toCQL()).toBe("DROP TYPE address;");
      expect(withKeyspace.toCQL()).toBe("DROP TYPE test.address;");
    });
  });

  describe("edge cases", () => {
    it("should handle simple type drop", () => {
      const builder = DropTypeBuilder.create(mockClient).type("minimal");

      expect(builder.toCQL()).toBe("DROP TYPE minimal;");
    });

    it("should handle special characters in type names", () => {
      const builder = DropTypeBuilder.create(mockClient).type("type_v1_final");

      expect(builder.toCQL()).toContain("type_v1_final");
    });

    it("should throw error when building without type name", () => {
      // eslint-disable-next-line
      const builder = DropTypeBuilder.create(mockClient).ifExists() as any;

      expect(() => builder.build()).toThrow("Type name is required");
    });
  });

  describe("real-world scenarios", () => {
    it("should drop an address type", async () => {
      const builder = DropTypeBuilder.create(mockClient)
        .keyspace("app")
        .type("address")
        .ifExists();

      const context = builder.build();
      await context.execute();

      expect(mockClient.execute).toHaveBeenCalledWith(
        "DROP TYPE IF EXISTS app.address;",
      );
    });

    it("should drop a user profile type without if exists", async () => {
      const builder = DropTypeBuilder.create(mockClient).type("user_profile");

      const context = builder.build();
      await context.execute();

      expect(mockClient.execute).toHaveBeenCalledWith(
        "DROP TYPE user_profile;",
      );
    });

    it("should safely drop a type that might not exist", async () => {
      const builder = DropTypeBuilder.create(mockClient)
        .keyspace("geo")
        .type("coordinates")
        .ifExists();

      expect(builder.toCQL()).toBe("DROP TYPE IF EXISTS geo.coordinates;");
    });
  });
});
