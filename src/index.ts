import app from "./app";
import { db } from "./shared/database";
import { initSocket, registerSocketNamespaces } from "./socket";
import { registerHttpRoutes } from "./http";
import { createServer } from "https";

async function bootstrap() {
  await db.connect();

  console.log("✅ Database connected successfully");

  const server = createServer(app);

  const io = initSocket(server);

  registerSocketNamespaces(io);

  registerHttpRoutes(app);

  server.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}

bootstrap();
