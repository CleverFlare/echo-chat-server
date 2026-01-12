import cassandra from "cassandra-driver";
import { env } from "@/env";

const { DATABASE_URL, DATA_CENTER, KEYSPACE } = env;

export const clientWithoutKeyspace = new cassandra.Client({
  contactPoints: [DATABASE_URL],
  localDataCenter: DATA_CENTER,
});

export const client = new cassandra.Client({
  contactPoints: [DATABASE_URL],
  localDataCenter: DATA_CENTER,
  keyspace: KEYSPACE,
});

export async function runDatabase() {
  try {
    await clientWithoutKeyspace.connect();
    console.log("Connected to Cassandra (no keyspace)");

    const query =
      "SELECT keyspace_name FROM system_schema.keyspaces WHERE keyspace_name = ?";
    const result = await clientWithoutKeyspace.execute(query, [KEYSPACE], {
      prepare: true,
    });

    if (result.rowLength === 0) {
      console.log(`Keyspace "${KEYSPACE}" does not exist. Creating...`);

      const createKeyspaceQuery = `
        CREATE KEYSPACE ${KEYSPACE}
        WITH replication = {
          'class': 'SimpleStrategy',
          'replication_factor': '1'
        }`;

      await clientWithoutKeyspace.execute(createKeyspaceQuery);
      console.log(`Keyspace "${KEYSPACE}" created.`);
    } else {
      console.log(`Keyspace "${KEYSPACE}" already exists.`);
    }

    await client.connect();
    console.log("Connected to Cassandra with keyspace");

    const versionResult = await client.execute(
      "SELECT release_version FROM system.local",
    );
    console.log("Cassandra version: " + versionResult.rows[0].release_version);
  } catch (err) {
    console.error("Connection error: " + err);
  } finally {
    await clientWithoutKeyspace.shutdown(); // Clean up the first client
  }
}
