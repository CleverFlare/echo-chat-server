/**
 * Formats a bound-parameter value into its CQL literal equivalent.
 *
 * This is used exclusively for human-readable debug output (toDebugCQL).
 * It is NEVER used in the execution path — values there are always passed
 * as bound parameters with { prepare: true }.
 *
 * CQL literal rules:
 *   string          → 'hello'          (single-quoted; interior ' escaped as '')
 *   number          → 42 / 3.14        (unquoted)
 *   boolean         → true / false     (unquoted lowercase)
 *   Date            → '2024-01-15T10:30:00.000Z'  (ISO-8601, single-quoted)
 *   null/undefined  → null
 *   Uint8Array      → 0x<hex>          (blob literal)
 *   Array           → ['a','b']        (list/set literal, elements formatted recursively)
 *   Map             → {'k':'v'}        (map literal, keys and values formatted recursively)
 *   object (plain)  → {'k':'v'}        (treated as map)
 */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    // Escape interior single quotes by doubling them (CQL standard)
    return `'${value.replace(/'/g, "''")}'`;
  }

  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }

  if (value instanceof Uint8Array) {
    const hex = Buffer.from(value).toString("hex");
    return `0x${hex}`;
  }

  if (value instanceof Map) {
    const entries = Array.from(value.entries())
      .map(([k, v]) => `${formatValue(k)}:${formatValue(v)}`)
      .join(", ");
    return `{${entries}}`;
  }

  if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(", ")}]`;
  }

  // Plain object — treat as a CQL map literal
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${formatValue(k)}:${formatValue(v)}`)
      .join(", ");
    return `{${entries}}`;
  }

  // Fallback: stringify whatever remains
  return String(value);
}

/**
 * Replaces each `?` placeholder in a parameterised CQL string with the
 * corresponding formatted literal value, in order.
 *
 * Throws if the number of placeholders does not match the number of values,
 * which would indicate a bug in the builder's value-assembly logic.
 */
export function inlineValues(cql: string, values: unknown[]): string {
  let index = 0;
  const result = cql.replace(/\?/g, () => {
    if (index >= values.length) {
      throw new Error(
        `inlineValues: more '?' placeholders than values (got ${values.length})`,
      );
    }
    return formatValue(values[index++]);
  });

  if (index !== values.length) {
    throw new Error(
      `inlineValues: ${values.length - index} value(s) unused after substitution`,
    );
  }

  return result;
}
