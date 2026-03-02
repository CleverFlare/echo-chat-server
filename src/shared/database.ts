import { CQL } from "@/cql";

export const db = new CQL({
  localDataCenter: Bun.env.DATA_CENTER,
  contactPoints: [Bun.env.DATABASE_URL],
  keyspace: Bun.env.KEYSPACE,
});
