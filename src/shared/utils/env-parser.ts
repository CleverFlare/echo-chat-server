import { z, ZodObject } from "zod/v4";

export function parse<const Schema extends ZodObject>(
  source: NodeJS.ProcessEnv,
  schema: Schema,
) {
  try {
    const env = schema.parse(source);
    return env as z.infer<typeof schema>;
  } catch (err) {
    console.error(`ENV ERROR:`, err);
    throw err;
  }
}
