import { camelCase } from "change-case";
import { CamelCasedProperties } from "type-fest";

export function toCamelCaseProperties<O extends Record<string, unknown>>(
  object: O,
): CamelCasedProperties<O> {
  return Object.entries(object).reduce(
    (prev, [key, value]) => ({ ...prev, [camelCase(key)]: value }),
    {},
  ) as CamelCasedProperties<O>;
}
