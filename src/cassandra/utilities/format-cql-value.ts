import { CassandraTypeMap } from "../types";

export function formatCqlValue(
  value: CassandraTypeMap[keyof CassandraTypeMap]["type"],
  cqlType: keyof CassandraTypeMap,
) {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return "NULL";
  }

  // Normalize the type to lowercase for comparison
  const type = cqlType.toLowerCase().trim();

  // Types that need single quotes
  const quotedTypes = [
    "text",
    "varchar",
    "ascii",
    "timestamp",
    "date",
    "time",
    "inet",
    "uuid",
    "timeuuid",
  ];

  // Check if this type needs quotes
  const needsQuotes = quotedTypes.some((t) => type.startsWith(t));

  if (needsQuotes) {
    // Convert value to string
    let stringValue = String(value);

    // Escape existing single quotes by doubling them
    stringValue = stringValue.replace(/'/g, "''");

    // Wrap in single quotes
    return `'${stringValue}'`;
  }

  // For numeric types, booleans, and other non-quoted types
  // Just return the value as-is
  return value;
}
