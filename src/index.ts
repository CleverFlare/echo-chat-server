import app from "./app";
import { db } from "./shared/database";
import { registerSockets } from "./socket";
import { registerHttpRoutes } from "./http";
import { createServer } from "https";
import { Server } from "socket.io";

async function bootstrap() {
  await db.connect();

  console.log("✅ Database connected successfully");

  const server = createServer(app);

  console.log("✅ Created HTTP server successfully");

  const io = new Server(server);

  console.log("✅ Attaching HTTP server to socket successfully");

  registerSockets(io);

  console.log("✅ Registered sockets successfully");

  registerHttpRoutes(app);

  console.log("✅ Registered HTTP routes successfully");

  server.listen(3000, () => {
    console.log(
      "Server running:\nport: 3000\nhost: localhost\nurl: http://localhost:3000",
    );
  });
}

bootstrap();
