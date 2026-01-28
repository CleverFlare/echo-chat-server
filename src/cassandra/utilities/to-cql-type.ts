import { ExtendedCassandraType } from "../types";

// Helper to generate CQL type strings
export function toCQLType(colDef: ExtendedCassandraType): string {
  if (typeof colDef === "string") {
    return colDef.toLowerCase();
  }

  const meta = colDef._meta;
  let cqlType: string;

  switch (meta.kind) {
    case "map":
      cqlType = `map<${meta.keyType.toLowerCase()}, ${meta.valueType.toLowerCase()}>`;
      break;
    case "set":
      cqlType = `set<${meta.elementType.toLowerCase()}>`;
      break;
    case "list":
      cqlType = `list<${meta.elementType.toLowerCase()}>`;
      break;
    case "tuple":
      cqlType = `tuple<${meta.types.map((t) => t.toLowerCase()).join(", ")}>`;
      break;
    case "udt":
      cqlType = meta.name; // UDT just uses its name
      break;
  }

  return "frozen" in meta && meta.frozen ? `frozen<${cqlType}>` : cqlType;
}
