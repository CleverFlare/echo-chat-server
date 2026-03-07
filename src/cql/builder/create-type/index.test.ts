import { cql } from "../../cql-types";
import { CreateTypeBuilder } from "./builder";
import { CreateTypeContext } from "./context";
import { describe, expect, it, test, vi } from "vitest";
import type { Client } from "cassandra-driver";

describe("CreateTypeBuilder", () => {
  const mockClient: Client = {
    execute: vi.fn().mockResolvedValue({ rows: [] }),
  } as unknown as Client;

  describe("static create()", () => {
    test("should create a new instance of CreateTypeBuilder", () => {
      const builder = CreateTypeBuilder.create(mockClient);
      expect(builder).toBeInstanceOf(CreateTypeBuilder);
    });
  });

  describe("keyspace()", () => {
    it("should set the keyspace name", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .keyspace("myKeyspace")
        .type("address")
        .schema({ street: cql.scalar.text });

      expect(builder.toCQL()).toContain('"myKeyspace"."address"');
    });

    it("should allow keyspace to be set before type", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .keyspace("test")
        .type("userType")
        .schema({ id: cql.scalar.uuid });

      expect(builder.toCQL()).toContain('"test"."userType"');
    });
  });

  describe("type()", () => {
    it("should set the type name", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("address")
        .schema({ street: cql.scalar.text });

      expect(builder.toCQL()).toContain('"address"');
    });

    it("should handle type names with multiple words", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("userProfileData")
        .schema({ name: cql.scalar.text });

      expect(builder.toCQL()).toContain('"userProfileData"');
    });
  });

  describe("ifNotExists()", () => {
    it("should add IF NOT EXISTS clause when true", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("address")
        .ifNotExists(true)
        .schema({ street: cql.scalar.text });

      expect(builder.toCQL()).toContain("IF NOT EXISTS");
    });

    it("should add IF NOT EXISTS clause when called without arguments", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("address")
        .ifNotExists()
        .schema({ street: cql.scalar.text });

      expect(builder.toCQL()).toContain("IF NOT EXISTS");
    });

    it("should not add IF NOT EXISTS clause when false", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("address")
        .ifNotExists(false)
        .schema({ street: cql.scalar.text });

      expect(builder.toCQL()).not.toContain("IF NOT EXISTS");
    });

    it("should position IF NOT EXISTS correctly in CQL", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .keyspace("test")
        .type("address")
        .ifNotExists()
        .schema({ street: cql.scalar.text });

      const cqlString = builder.toCQL();
      const ifNotExistsIndex = cqlString.indexOf("IF NOT EXISTS");
      const schemaIndex = cqlString.indexOf("(");
      expect(ifNotExistsIndex).toBeLessThan(schemaIndex);
    });
  });

  describe("schema()", () => {
    it("should define UDT fields with single field", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("simple")
        .schema({ value: cql.scalar.text });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain('"value"');
      expect(cqlString).toMatch(/\(\s*\n\s*"value"/);
    });

    it("should define UDT fields with multiple fields", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("address")
        .schema({
          street: cql.scalar.text,
          city: cql.scalar.text,
          zipCode: cql.scalar.text,
          country: cql.scalar.text,
        });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain('"street"');
      expect(cqlString).toContain('"city"');
      expect(cqlString).toContain('"zipCode"');
      expect(cqlString).toContain('"country"');
    });

    it("should handle various CQL types", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("complexType")
        .schema({
          id: cql.scalar.uuid,
          name: cql.scalar.text,
          count: cql.scalar.int,
          value: cql.scalar.bigint,
          price: cql.scalar.decimal,
          timestamp: cql.scalar.timestamp,
          active: cql.scalar.boolean,
          rating: cql.scalar.double,
        });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain('"id"');
      expect(cqlString).toContain('"name"');
      expect(cqlString).toContain('"count"');
      expect(cqlString).toContain('"value"');
      expect(cqlString).toContain('"price"');
      expect(cqlString).toContain('"timestamp"');
      expect(cqlString).toContain('"active"');
      expect(cqlString).toContain('"rating"');
    });

    it("should format fields with line breaks", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("address")
        .schema({
          street: cql.scalar.text,
          city: cql.scalar.text,
        });

      const cqlString = builder.toCQL();
      expect(cqlString).toMatch(/\(\s*\n/);
      expect(cqlString).toContain(",\n");
    });

    it("should handle single character field names", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("coords")
        .schema({
          x: cql.scalar.double,
          y: cql.scalar.double,
          z: cql.scalar.double,
        });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain('"x"');
      expect(cqlString).toContain('"y"');
      expect(cqlString).toContain('"z"');
    });
  });

  describe("toCQL()", () => {
    it("should generate basic CREATE TYPE statement", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("address")
        .schema({ street: cql.scalar.text });

      const cqlString = builder.toCQL();
      expect(cqlString).toMatch(/^CREATE TYPE/);
      expect(cqlString).toContain('"address"');
      expect(cqlString).toMatch(/;$/);
    });

    it("should generate CREATE TYPE with keyspace", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .keyspace("testKeyspace")
        .type("address")
        .schema({ street: cql.scalar.text });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain('"testKeyspace"."address"');
    });

    it("should generate CREATE TYPE IF NOT EXISTS", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("address")
        .ifNotExists()
        .schema({ street: cql.scalar.text });

      const cqlString = builder.toCQL();
      expect(cqlString).toMatch(/CREATE TYPE .* IF NOT EXISTS/);
    });

    it("should generate complete CQL statement", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .keyspace("myKeyspace")
        .type("fullAddress")
        .ifNotExists()
        .schema({
          streetAddress: cql.scalar.text,
          city: cql.scalar.text,
          state: cql.scalar.text,
          zipCode: cql.scalar.text,
          country: cql.scalar.text,
        });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain("CREATE TYPE");
      expect(cqlString).toContain('"myKeyspace"."fullAddress"');
      expect(cqlString).toContain("IF NOT EXISTS");
      expect(cqlString).toContain('"streetAddress"');
      expect(cqlString).toContain('"city"');
      expect(cqlString).toContain('"state"');
      expect(cqlString).toContain('"zipCode"');
      expect(cqlString).toContain('"country"');
      expect(cqlString).toMatch(/;$/);
    });

    it("should generate type without keyspace", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("simpleType")
        .schema({ value: cql.scalar.int });

      const cqlString = builder.toCQL();
      expect(cqlString).toMatch(/^CREATE TYPE "simpleType"/);
      expect(cqlString).not.toContain(".");
    });

    it("should throw error when type name is missing", () => {
      const builder = CreateTypeBuilder.create(mockClient).schema({
        value: cql.scalar.text,
      });

      // @ts-expect-error Don't worry about it
      expect(() => builder.toCQL()).toThrow("Type name is required");
    });

    it("should maintain proper CQL syntax structure", () => {
      const builder = CreateTypeBuilder.create(mockClient).type("test").schema({
        field1: cql.scalar.text,
        field2: cql.scalar.int,
      });

      const cqlString = builder.toCQL();
      expect(cqlString).toMatch(
        /CREATE TYPE "test" \(\s*"field1"[^,]+,\s*"field2"[^)]+\);/,
      );
    });
  });

  describe("build()", () => {
    it("should return a CreateTypeContext instance", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("address")
        .schema({ street: cql.scalar.text });

      const context = builder.build();
      expect(context).toBeInstanceOf(CreateTypeContext);
    });

    it("should preserve the context information", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .keyspace("testKeyspace")
        .type("address")
        .schema({
          street: cql.scalar.text,
          city: cql.scalar.text,
        });

      const context = builder.build();
      const typeRef = context.asType();
      expect(typeRef.cql).toBe("address");
      expect(typeRef._meta.kind).toBe("udt");
      expect(typeRef._meta.name).toBe("address");
      expect(typeRef._meta.schema).toBeDefined();
    });

    it("should generate the same CQL from context", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .keyspace("test")
        .type("address")
        .schema({
          street: cql.scalar.text,
          city: cql.scalar.text,
        });

      const builderCQL = builder.toCQL();
      const context = builder.build();
      const contextCQL = context.toCQL();

      expect(contextCQL).toBe(builderCQL);
    });

    it("should preserve schema with camelCase field names", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("userProfile")
        .schema({
          firstName: cql.scalar.text,
          lastName: cql.scalar.text,
        });

      const context = builder.build();
      const typeRef = context.asType();
      expect(typeRef._meta.schema).toHaveProperty("firstName");
      expect(typeRef._meta.schema).toHaveProperty("lastName");
    });
  });

  describe("CreateTypeContext", () => {
    describe("asType()", () => {
      it("should return a valid CqlType object", () => {
        const builder = CreateTypeBuilder.create(mockClient)
          .type("address")
          .schema({
            street: cql.scalar.text,
            city: cql.scalar.text,
          });

        const context = builder.build();
        const typeRef = context.asType();

        expect(typeRef).toHaveProperty("cql");
        expect(typeRef).toHaveProperty("_meta");
        expect(typeRef.cql).toBe("address");
      });

      it("should have correct metadata", () => {
        const builder = CreateTypeBuilder.create(mockClient)
          .type("userData")
          .schema({
            id: cql.scalar.uuid,
            name: cql.scalar.text,
          });

        const context = builder.build();
        const typeRef = context.asType();

        expect(typeRef._meta.kind).toBe("udt");
        expect(typeRef._meta.name).toBe("userData");
        expect(typeRef._meta.schema).toBeDefined();
      });

      it("should preserve schema in metadata", () => {
        const schema = {
          street: cql.scalar.text,
          city: cql.scalar.text,
          zipCode: cql.scalar.text,
        };

        const builder = CreateTypeBuilder.create(mockClient)
          .type("address")
          .schema(schema);

        const context = builder.build();
        const typeRef = context.asType();

        expect(typeRef._meta.schema).toHaveProperty("street");
        expect(typeRef._meta.schema).toHaveProperty("city");
        expect(typeRef._meta.schema).toHaveProperty("zipCode");
      });
    });

    describe("execute()", () => {
      it("should execute the CREATE TYPE statement", async () => {
        const builder = CreateTypeBuilder.create(mockClient)
          .type("address")
          .schema({ street: cql.scalar.text });

        const context = builder.build();
        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          expect.stringContaining('CREATE TYPE "address"'),
        );
      });

      it("should execute with keyspace", async () => {
        const builder = CreateTypeBuilder.create(mockClient)
          .keyspace("test")
          .type("address")
          .schema({ street: cql.scalar.text });

        const context = builder.build();
        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          expect.stringContaining('"test"."address"'),
        );
      });

      it("should execute with IF NOT EXISTS", async () => {
        const builder = CreateTypeBuilder.create(mockClient)
          .type("address")
          .ifNotExists()
          .schema({ street: cql.scalar.text });

        const context = builder.build();
        await context.execute();

        expect(mockClient.execute).toHaveBeenCalledWith(
          expect.stringContaining("IF NOT EXISTS"),
        );
      });

      it("should execute complete statement", async () => {
        const builder = CreateTypeBuilder.create(mockClient)
          .keyspace("testKeyspace")
          .type("fullAddress")
          .ifNotExists()
          .schema({
            street: cql.scalar.text,
            city: cql.scalar.text,
            zipCode: cql.scalar.text,
          });

        const context = builder.build();
        await context.execute();

        expect(mockClient.execute).toHaveBeenLastCalledWith(
          expect.stringMatching(
            /CREATE TYPE "testKeyspace"\."fullAddress" IF NOT EXISTS .*/,
          ),
        );
      });

      it("should handle execution errors", async () => {
        const errorClient = {
          execute: vi.fn().mockRejectedValue(new Error("Execution failed")),
        } as unknown as Client;

        const builder = CreateTypeBuilder.create(errorClient)
          .type("address")
          .schema({ street: cql.scalar.text });

        const context = builder.build();

        await expect(context.execute()).rejects.toThrow("Execution failed");
      });
    });

    describe("toCQL()", () => {
      it("should return the CQL statement", () => {
        const builder = CreateTypeBuilder.create(mockClient)
          .type("address")
          .schema({ street: cql.scalar.text });

        const context = builder.build();
        const cqlString = context.toCQL();

        expect(cqlString).toContain("CREATE TYPE");
        expect(cqlString).toContain('"address"');
      });
    });
  });

  describe("method chaining", () => {
    it("should allow chaining all methods in various orders", () => {
      expect(() => {
        CreateTypeBuilder.create(mockClient)
          .keyspace("test")
          .type("address")
          .ifNotExists()
          .schema({
            street: cql.scalar.text,
            city: cql.scalar.text,
          })
          .build();
      }).not.toThrow();
    });

    it("should allow type before keyspace", () => {
      expect(() => {
        CreateTypeBuilder.create(mockClient)
          .type("address")
          .keyspace("test")
          .schema({ street: cql.scalar.text })
          .build();
      }).not.toThrow();
    });

    it("should allow ifNotExists at different positions", () => {
      const cql1 = CreateTypeBuilder.create(mockClient)
        .ifNotExists()
        .keyspace("test")
        .type("address")
        .schema({ street: cql.scalar.text })
        .toCQL();

      const cql2 = CreateTypeBuilder.create(mockClient)
        .keyspace("test")
        .type("address")
        .ifNotExists()
        .schema({ street: cql.scalar.text })
        .toCQL();

      expect(cql1).toBe(cql2);
    });

    it("should maintain immutability through cloning", () => {
      const base = CreateTypeBuilder.create(mockClient).type("address");
      const withKeyspace = base.keyspace("test");

      const baseWithSchema = base.schema({ street: cql.scalar.text });
      const keyspaceWithSchema = withKeyspace.schema({
        street: cql.scalar.text,
      });

      expect(baseWithSchema.toCQL()).not.toContain('"test".');
      expect(keyspaceWithSchema.toCQL()).toContain('"test".');
    });
  });

  describe("edge cases", () => {
    it("should handle type with minimal fields", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("minimal")
        .schema({ value: cql.scalar.text });

      expect(builder.toCQL()).toMatch(
        /CREATE TYPE "minimal" \(\s*"value"[\s\S]*\);/,
      );
    });

    it("should handle type with many fields", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("largeType")
        .schema({
          field1: cql.scalar.text,
          field2: cql.scalar.int,
          field3: cql.scalar.bigint,
          field4: cql.scalar.timestamp,
          field5: cql.scalar.boolean,
          field6: cql.scalar.double,
          field7: cql.scalar.float,
          field8: cql.scalar.uuid,
          field9: cql.scalar.decimal,
          field10: cql.scalar.text,
        });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain('"field1"');
      expect(cqlString).toContain('"field10"');
    });

    it("should handle complex field names with numbers", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("versioned")
        .schema({
          field1Value: cql.scalar.text,
          field2Value: cql.scalar.int,
          version3Data: cql.scalar.text,
        });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain('"field1Value"');
      expect(cqlString).toContain('"field2Value"');
      expect(cqlString).toContain('"version3Data"');
    });

    it("should throw error when building without type name", () => {
      const builder = CreateTypeBuilder.create(mockClient).schema({
        value: cql.scalar.text,
        // eslint-disable-next-line
      }) as any;

      expect(() => builder.build()).toThrow("Type name is required");
    });

    it("should handle special characters in type names", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("typeV1Final")
        .schema({ data: cql.scalar.text });

      expect(builder.toCQL()).toContain('"typeV1Final"');
    });
  });

  describe("real-world scenarios", () => {
    it("should create an address type", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .keyspace("app")
        .type("address")
        .ifNotExists()
        .schema({
          street: cql.scalar.text,
          city: cql.scalar.text,
          state: cql.scalar.text,
          zipCode: cql.scalar.text,
          country: cql.scalar.text,
        });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain('"app"."address"');
      expect(cqlString).toContain("IF NOT EXISTS");
      expect(cqlString).toContain('"street"');
      expect(cqlString).toContain('"zipCode"');
    });

    it("should create a user profile type", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .type("userProfile")
        .schema({
          displayName: cql.scalar.text,
          bio: cql.scalar.text,
          avatarUrl: cql.scalar.text,
          createdAt: cql.scalar.timestamp,
          isVerified: cql.scalar.boolean,
        });

      const cqlString = builder.toCQL();
      expect(cqlString).toContain('"displayName"');
      expect(cqlString).toContain('"avatarUrl"');
      expect(cqlString).toContain('"createdAt"');
      expect(cqlString).toContain('"isVerified"');
    });

    it("should create a coordinate type for geolocation", () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .keyspace("geo")
        .type("coordinates")
        .schema({
          latitude: cql.scalar.double,
          longitude: cql.scalar.double,
          altitude: cql.scalar.double,
        });

      const context = builder.build();
      const typeRef = context.asType();

      expect(typeRef.cql).toBe("coordinates");
      expect(typeRef._meta.kind).toBe("udt");
    });

    it("should create and execute a product info type", async () => {
      const builder = CreateTypeBuilder.create(mockClient)
        .keyspace("ecommerce")
        .type("productInfo")
        .ifNotExists()
        .schema({
          productId: cql.scalar.uuid,
          productName: cql.scalar.text,
          price: cql.scalar.decimal,
          inStock: cql.scalar.boolean,
        });

      const context = builder.build();
      await context.execute();

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.stringContaining('"ecommerce"."productInfo"'),
      );
    });
  });
});
