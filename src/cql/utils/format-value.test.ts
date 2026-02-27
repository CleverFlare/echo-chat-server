import { describe, it, expect } from "vitest";
import { formatValue, inlineValues } from "./format-value";

describe("formatValue", () => {
  describe("null / undefined", () => {
    it("formats null as null", () => {
      expect(formatValue(null)).toBe("null");
    });
    it("formats undefined as null", () => {
      expect(formatValue(undefined)).toBe("null");
    });
  });

  describe("booleans", () => {
    it("formats true as true", () => {
      expect(formatValue(true)).toBe("true");
    });
    it("formats false as false", () => {
      expect(formatValue(false)).toBe("false");
    });
  });

  describe("numbers", () => {
    it("formats integers", () => {
      expect(formatValue(42)).toBe("42");
    });
    it("formats floats", () => {
      expect(formatValue(3.14)).toBe("3.14");
    });
    it("formats zero", () => {
      expect(formatValue(0)).toBe("0");
    });
    it("formats negative numbers", () => {
      expect(formatValue(-7)).toBe("-7");
    });
  });

  describe("strings", () => {
    it("wraps in single quotes", () => {
      expect(formatValue("hello")).toBe("'hello'");
    });
    it("escapes interior single quotes by doubling them", () => {
      expect(formatValue("it's")).toBe("'it''s'");
    });
    it("handles empty string", () => {
      expect(formatValue("")).toBe("''");
    });
    it("handles multiple single quotes", () => {
      expect(formatValue("a'b'c")).toBe("'a''b''c'");
    });
  });

  describe("Date", () => {
    it("formats a Date as a single-quoted ISO-8601 string", () => {
      const d = new Date("2024-01-15T10:30:00.000Z");
      expect(formatValue(d)).toBe("'2024-01-15T10:30:00.000Z'");
    });
  });

  describe("Uint8Array (blob)", () => {
    it("formats as 0x<hex>", () => {
      const buf = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
      expect(formatValue(buf)).toBe("0xdeadbeef");
    });
    it("formats an empty buffer", () => {
      expect(formatValue(new Uint8Array([]))).toBe("0x");
    });
  });

  describe("Array (list / set)", () => {
    it("formats an array of strings", () => {
      expect(formatValue(["a", "b", "c"])).toBe("['a', 'b', 'c']");
    });
    it("formats an array of numbers", () => {
      expect(formatValue([1, 2, 3])).toBe("[1, 2, 3]");
    });
    it("formats an empty array", () => {
      expect(formatValue([])).toBe("[]");
    });
    it("formats nested arrays", () => {
      expect(formatValue([["x", "y"], ["z"]])).toBe("[['x', 'y'], ['z']]");
    });
  });

  describe("Map", () => {
    it("formats a Map<string, number>", () => {
      const m = new Map([
        ["age", 30],
        ["score", 99],
      ]);
      expect(formatValue(m)).toBe("{'age':30, 'score':99}");
    });
    it("formats an empty Map", () => {
      expect(formatValue(new Map())).toBe("{}");
    });
  });

  describe("plain object (treated as CQL map)", () => {
    it("formats a plain object", () => {
      expect(
        formatValue({ class: "org.apache.cassandra.locator.SimpleStrategy" }),
      ).toBe("{'class':'org.apache.cassandra.locator.SimpleStrategy'}");
    });
    it("formats an empty object", () => {
      expect(formatValue({})).toBe("{}");
    });
  });
});

describe("inlineValues", () => {
  it("replaces a single placeholder", () => {
    expect(inlineValues("SELECT * FROM t WHERE id = ?;", ["abc"])).toBe(
      "SELECT * FROM t WHERE id = 'abc';",
    );
  });

  it("replaces multiple placeholders in order", () => {
    expect(
      inlineValues("INSERT INTO t (a, b) VALUES (?, ?);", ["hello", 42]),
    ).toBe("INSERT INTO t (a, b) VALUES ('hello', 42);");
  });

  it("handles a mix of types", () => {
    const d = new Date("2024-06-01T00:00:00.000Z");
    expect(
      inlineValues("INSERT INTO t (a, b, c, d) VALUES (?, ?, ?, ?);", [
        "text",
        true,
        7,
        d,
      ]),
    ).toBe(
      "INSERT INTO t (a, b, c, d) VALUES ('text', true, 7, '2024-06-01T00:00:00.000Z');",
    );
  });

  it("throws when there are more placeholders than values", () => {
    expect(() => inlineValues("? AND ?", ["only-one"])).toThrow(
      /more '\?' placeholders than values/,
    );
  });

  it("throws when there are more values than placeholders", () => {
    expect(() => inlineValues("WHERE id = ?", ["a", "b"])).toThrow(
      /value\(s\) unused/,
    );
  });

  it("handles zero placeholders and zero values", () => {
    expect(inlineValues("SELECT 1;", [])).toBe("SELECT 1;");
  });
});
