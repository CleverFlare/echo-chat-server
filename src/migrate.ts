import { cols, log, pad, warn } from "@monitext/nprint";
import { CQL } from "./cql";
import { CreateTypeBuilderInput } from "./cql/builder/create-type/types";
import { TableContext } from "./cql/types";
import {
  people,
  friendRequests,
  blocks,
  friends,
  friendRequestsBySenderId,
  chats,
} from "./modules/contacts/schema";
import { exit } from "process";
import { userByEmail, userById, userByPhone } from "./modules/auth/schema";
import { CreateTableContext } from "./cql/builder/create-table/context";
import { CreateTypeContext } from "./cql/builder/create-type/context";

warn(
  pad(cols.yellow("⚠️ Migrations reset the schemas you provide."), { x: 2 }),
);

// A simple migrate function that just drops all schemas and reconstruct them (for development purposes)
async function migrate({
  tables,
  udts,
}: {
  tables: CreateTableContext<TableContext>[];
  udts: CreateTypeContext<CreateTypeBuilderInput>[];
}) {
  const db = new CQL({
    localDataCenter: process.env.DATA_CENTER,
    contactPoints: [process.env.DATABASE_URL],
    keyspace: process.env.KEYSPACE,
  });

  log(pad(cols.dim("Connecting to database..."), { x: 2 }));

  await db.connect();

  for (const schema of [...tables, ...udts]) {
    if (schema instanceof CreateTableContext) {
      const table = schema;
      await table.drop().build().execute();
      log(
        pad(`✅ Successfully dropped ${table.context.table} to rebuild it.`, {
          x: 2,
        }),
      );
    }
    if (schema instanceof CreateTypeContext) {
      const type = schema;
      await type.drop().build().execute();
      log(
        pad(`✅ Successfully dropped ${type.context.type} to rebuild it.`, {
          x: 2,
        }),
      );
    }
  }

  for (const schema of [...udts, ...tables]) {
    if (schema instanceof CreateTableContext) {
      const table = schema;
      await table.execute();
      log(
        pad(`✅ Successfully built ${table.context.table}.`, {
          x: 2,
        }),
      );
    }
    if (schema instanceof CreateTypeContext) {
      const type = schema;
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
    people,
    chats,
    friendRequests,
    blocks,
    friends,
    friendRequestsBySenderId,
    userByPhone,
    userByEmail,
    userById,
  ],
  udts: [],
});
