Node.js server for Echo Chat, a chat application the shares some resemblence to both WhatsApp and Discord.

<!-- ## Decisions & Philosophy Behind The Code Structure -->
<!---->
<!-- Code structure has always been a point of contention among developers, with each claiming his own structure is ultimate best one of all time. -->
<!-- I'm a developer and I'm compelled to believe the same, however, the difference is that I'm going to back up my claims and why I do believe my structure is probably the best **in this specific project**. -->

---

## 🗄️ How to run the database

1. Ensure you've got both docker and docker-compose installed on your local machine.
2. Open the terminal emulator.
3. Use the `cd` command to navigate to the projects directory and set it as the current working directory in the terminal.
4. Run the following docker-compose command:

   ```BASH
   docker-compose up -d
   ```

   The `-d` option ensures the process is forked to run in the background.

5. After a successful pull of the Apache Cassandra image, use the following command to inspect the IP address of the container:

   ```BASH
   docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' cass_cluster
   ```

6. Set the `DATABASE_URL` environment variable to the container's IP address, and set the rest of the environment variables exactly as follows:

   ```
   DATABASE_URL=<THE IP ADDRESS OF THE CONTAINER>
   DATA_CENTER="datacenter1"
   KEYSPACE="sportex"
   ```

7. Run the following command to populate the schemas:
   ```
   npm run migrate
   ```
