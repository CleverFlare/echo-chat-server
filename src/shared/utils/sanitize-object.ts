export function sanitizeObject<
  T extends Record<string, unknown>,
  B extends string[],
>(object: T, ...propertiesToRemove: B): Omit<T, B[number]> {
  const sanitizedObject = { ...object };

  for (const property of propertiesToRemove) {
    delete sanitizedObject[property];
  }

  return sanitizedObject;
}
