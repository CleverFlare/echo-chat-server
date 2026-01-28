import { Socket } from "socket.io";
import { jwtVerify } from "jose";
import { env } from "@/env";
import {
  deleteConnectedUserBySocketId,
  insertConnectedUser,
} from "./auth.repository";
import { logger } from "@/shared/logger";

export async function setupHandshakeAuth(socket: Socket) {
  socket.on("disconnect", async () => {
    await deleteConnectedUserBySocketId(socket.id);
  });

  if (!socket?.handshake?.headers?.authorization) {
    socket.disconnect();
    return;
  }

  logger.info(`New Connection: ${socket.handshake.headers.authorization}`);

  const {
    payload: {
      data: { id },
    },
  } = await jwtVerify<{ data: { id: string } }>(
    socket.handshake.headers.authorization,
    new TextEncoder().encode(env.JWT_PRIVATE),
  );

  await insertConnectedUser({ userId: id, socketId: socket.id });
}
