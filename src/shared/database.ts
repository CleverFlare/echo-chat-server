import { Cassandra } from "@/cassandra/builders/cassandra";
import { env } from "@/env";

export const cassandra = new Cassandra({
  localDataCenter: env.DATA_CENTER,
  contactPoints: [env.DATABASE_URL],
  keyspace: env.KEYSPACE,
});
