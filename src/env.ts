import dotenv from "dotenv";
dotenv.config();
import { parse } from "./shared/utils/env-parser";
import { z } from "zod/v4";

export const env = parse(
  process.env,
  z.object({
    DATABASE_URL: z.string(),
    DATA_CENTER: z.string(),
    KEYSPACE: z.string(),
    HASH_SALT: z.coerce.number(),
    JWT_PRIVATE: z.string(),
    AUTH_POSTGRES_URL: z.string(),
  }),
);
