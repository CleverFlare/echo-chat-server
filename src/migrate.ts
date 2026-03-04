import { cols, log, pad, warn } from "@monitext/nprint";
import { CQL } from "./cql";
import { CreateTableBuilder } from "./cql/builder/create-table/builder";
import { CreateTypeBuilder } from "./cql/builder/create-type/builder";
import { CreateTypeBuilderInput } from "./cql/builder/create-type/types";
import { TableContext } from "./cql/types";
import {
  lastMessage,
  contactByUserId,
  contactByHandle,
} from "./modules/contacts/schema";
import { messageByChatId } from "./modules/messages/schema";
import { exit } from "process";
import { userByEmail, userById, userByPhone } from "./modules/auth/schema";

warn(
  pad(cols.yellow("⚠️ Migrations reset the schemas you provide."), { x: 2 }),
);

// A simple migrate function that just drops all schemas and reconstruct them (for development purposes)
async function migrate({
  tables,
  udts,
}: {
  tables: CreateTableBuilder<TableContext>[];
  udts: CreateTypeBuilder<CreateTypeBuilderInput>[];
}) {
  const db = new CQL({
    localDataCenter: process.env.DATA_CENTER,
    contactPoints: [process.env.DATABASE_URL],
    keyspace: process.env.KEYSPACE,
  });

  log(pad(cols.dim("Connecting to database..."), { x: 2 }));

  await db.connect();

  for (const schema of [...tables, ...udts]) {
    if (schema instanceof CreateTableBuilder) {
      const table = schema.build();
      await table.drop().build().execute();
      log(
        pad(`✅ Successfully dropped ${table.context.table} to rebuild it.`, {
          x: 2,
        }),
      );
    }
    if (schema instanceof CreateTypeBuilder) {
      const type = schema.build();
      await type.drop().build().execute();
      log(
        pad(`✅ Successfully dropped ${type.context.type} to rebuild it.`, {
          x: 2,
        }),
      );
    }
  }

  for (const schema of [...udts, ...tables]) {
    if (schema instanceof CreateTableBuilder) {
      const table = schema.build();
      await table.execute();
      log(
        pad(`✅ Successfully built ${table.context.table}.`, {
          x: 2,
        }),
      );
    }
    if (schema instanceof CreateTypeBuilder) {
      const type = schema.build();
      await type.execute();
      log(
        pad(`✅ Successfully built ${type.context.type}.`, {
          x: 2,
        }),
      );
    }
  }

  log(pad(cols.dim("Disconnecting from database..."), { x: 2 }));

  await db.shutdown();

  exit(0);
}

migrate({
  tables: [
    messageByChatId,
    contactByHandle,
    contactByUserId,
    userByPhone,
    userByEmail,
    userById,
  ],
  udts: [lastMessage],
});
