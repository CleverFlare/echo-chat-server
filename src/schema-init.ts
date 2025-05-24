import { env } from "@/env";
import { client, clientWithoutKeyspace } from "./shared/database";
import * as path from "path";
import glob from "fast-glob";
import { logger } from "./shared/logger";

const { KEYSPACE } = env;

async function dropAllTables(keyspace: string) {
  await clientWithoutKeyspace.connect();
  logger.info("Connected to Cassandra (no keyspace)");

  const query =
    "SELECT keyspace_name FROM system_schema.keyspaces WHERE keyspace_name = ?";

  const result = await clientWithoutKeyspace.execute(query, [KEYSPACE], {
    prepare: true,
  });

  if (result.rowLength === 0) {
    logger.info(`Keyspace "${KEYSPACE}" does not exist. Creating...`);

    const createKeyspaceQuery = `
        CREATE KEYSPACE ${KEYSPACE}
        WITH replication = {
          'class': 'SimpleStrategy',
          'replication_factor': '1'
        }`;

    await clientWithoutKeyspace.execute(createKeyspaceQuery);
    logger.info(`Keyspace "${KEYSPACE}" created.`);
  } else {
    logger.info(`Keyspace "${KEYSPACE}" already exists.`);

    const query =
      "SELECT table_name FROM system_schema.tables WHERE keyspace_name = ?";
    const result = await client.execute(query, [keyspace], {
      prepare: true,
    });

    const tableNames = result.rows.map((row) => row.table_name);

    for (const table of tableNames) {
      const dropQuery = `DROP TABLE IF EXISTS ${keyspace}.${table}`;
      console.log(`🗑 Dropping table: ${table}`);
      try {
        await client.execute(dropQuery);
        console.log(`✅ Dropped: ${table}`);
      } catch (err) {
        console.error(`❌ Failed to drop ${table}:`, err);
      }
    }
  }

  await clientWithoutKeyspace.shutdown();
}

async function initSchemas() {
  const keyspace = env.KEYSPACE;

  if (!keyspace) throw new Error("KEYSPACE env var not set");

  // 1. Drop all existing tables
  await dropAllTables(keyspace);

  await client.connect();

  // 2. Run schema definitions
  const schemaFiles = await glob("src/modules/**/**/*.schema.ts");

  for (const file of schemaFiles) {
    const fullPath = path.resolve(file);
    const schemaModule = await import(fullPath);

    for (const key in schemaModule) {
      const data = schemaModule[key];

      if (typeof data === "string") {
        console.log(`🔧 Running: ${key} from ${file}`);

        try {
          await client.execute(data);
          console.log(`✅ Success: ${key}`);
        } catch (error) {
          console.error(`❌ Error running ${key}:\n`, error);
        }
      }
    }
  }

  await client.shutdown();
}

initSchemas().catch((err) => {
  console.error("Schema initialization failed:", err);
});
