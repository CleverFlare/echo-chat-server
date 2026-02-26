import { CQL } from "@/cql";
import { env } from "@/env";

export const db = new CQL({
  localDataCenter: env.DATA_CENTER,
  contactPoints: [env.DATABASE_URL],
  keyspace: env.KEYSPACE,
});
