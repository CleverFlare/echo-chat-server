import { describe, it, expect } from "vitest";
import { types } from "./scalar";
import { list, map, tuple, frozen, set } from "./collection";

describe("CQL generation", () => {
  it("generates list CQL", () => {
    expect(list(types.text).cql).toBe("LIST<TEXT>");
  });

  it("generates set CQL", () => {
    expect(set(types.int).cql).toBe("SET<INT>");
  });

  it("generates map CQL", () => {
    expect(map(types.text, types.int).cql).toBe("MAP<TEXT, INT>");
  });

  it("generates tuple CQL", () => {
    expect(tuple(types.text, types.int).cql).toBe("TUPLE<TEXT, INT>");
  });

  it("generates frozen CQL", () => {
    expect(frozen(types.text).cql).toBe("FROZEN<TEXT>");
  });
});
