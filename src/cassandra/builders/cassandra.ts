import cassandra from "cassandra-driver";
import { CreateTableBuilder } from "./create-table";

type InitializeOptions = {
  /** Will create the keyspace if it doesn't already exist */
  initializeKeyspace?: boolean;
};

// Top-level class that gives access to all the builders and methods
export class Cassandra {
  public client: cassandra.Client;

  constructor(private params: cassandra.ClientOptions) {
    this.client = new cassandra.Client({
      ...params,
    });
  }

  async initialize({ initializeKeyspace = true }: InitializeOptions) {
    // Initialize keyspace when the client has a keyspance and `initializeKeyspace` is set to true (defaults to true)
    if (this.client.keyspace && initializeKeyspace) {
      try {
        // Create a temporary client with no keyspace
        const noKeyspaceClient = new cassandra.Client({
          ...this.params,
          keyspace: undefined,
        });

        // Connect to the temporary client
        console.log("Connecting to Cassandra...");
        await noKeyspaceClient.connect();

        // Create keyspace if it doesn't exist
        console.log("Initializing keyspace...");
        const query = `CREATE KEYSPACE IF NOT EXISTS ${this.client.keyspace} WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 };`;
        await noKeyspaceClient.execute(query);

        console.log("✅ Keyspace initialized");

        // Shutdown the temporary client
        await noKeyspaceClient.shutdown();
      } catch (err) {
        console.error("Something went wrong!");
        console.error(err);
      }

      // Connect to the client with keyspace
      console.log("Connecting to keyspace...");
      await this.client.connect();

      console.log("✅ Keyspace connected");

      // Return an instance of Cassandra with the keyspace client
      return this;
    } else {
      console.log("Connecting to Cassandra...");

      await this.client.connect();

      console.log("✅ Cassandra connected");

      return this;
    }
  }

  create() {
    if (!this.client)
      throw new Error(
        "You haven't initialized Cassandra before calling `create`",
      );

    const { client } = this;

    return {
      table(tableName: string, keyspaceName?: string) {
        return new CreateTableBuilder(client).table(tableName, keyspaceName);
      },
    };
  }
}
