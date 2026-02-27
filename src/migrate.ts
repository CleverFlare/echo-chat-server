import { CQL } from "./cql";
import { CreateTableBuilder } from "./cql/builder/create-table/builder";
import { CreateTypeBuilder } from "./cql/builder/create-type/builder";
import { env } from "./env";

export const db = new CQL({
  localDataCenter: env.DATA_CENTER,
  contactPoints: [env.DATABASE_URL],
  keyspace: env.KEYSPACE,
});

// A simple migrate function that just drops all schemas and reconstruct them (for development purposes)
async function migrate(
  // eslint-disable-next-line
  ...schemas: (CreateTableBuilder<any> | CreateTypeBuilder<any>)[]
) {
  for (const schema of schemas) {
    schema.build();
  }
}

migrate();
