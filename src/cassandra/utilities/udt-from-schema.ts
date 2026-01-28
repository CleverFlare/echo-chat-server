import { ColumnDefinitions, UDTReference } from "../types";

// Helper to create a UDT reference from your builder's schema
export function udtFromSchema<const C extends ColumnDefinitions>(
  typeName: string,
  schema: C,
): UDTReference<C> {
  return {
    // eslint-disable-next-line
    type: {} as any,
    cqlType: typeName,
    operators: "=" as const,
    _meta: { kind: "udt", name: typeName, fields: schema },
  };
}
