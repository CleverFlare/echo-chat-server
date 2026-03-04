import { CQL } from "@/cql";

export const db = new CQL({
  localDataCenter: process.env.DATA_CENTER,
  contactPoints: [process.env.DATABASE_URL],
  keyspace: process.env.KEYSPACE,
});
