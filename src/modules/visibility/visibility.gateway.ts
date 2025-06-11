import { Socket } from "socket.io";
import { findConnectedUserByUserId } from "../auth/auth.repository";
import { findContacts } from "../contacts/contacts.repository";
import { jwtVerify } from "jose";
import { env } from "@/env";

export async function setupVisibilityGateway(socket: Socket) {
  const token = socket.handshake.headers.authorization!;

  const {
    payload: {
      data: { id: userId },
    },
  } = await jwtVerify<{ data: { id: string } }>(
    token,
    new TextEncoder().encode(env.JWT_PRIVATE),
  );

  const userContacts = await findContacts<{ contact_id: string }>(userId);

  for (const contact of userContacts) {
    const connectedUser = await findConnectedUserByUserId<{
      socket_id: string;
    }>(contact.contact_id);

    if (!connectedUser) continue;

    socket.volatile
      .to(connectedUser.socket_id)
      .emit("online", { userId, isOnline: true });
  }

  socket.on("disconnect", async () => {
    const userContacts = await findContacts<{ contact_id: string }>(userId);

    for (const contact of userContacts) {
      const connectedUser = await findConnectedUserByUserId<{
        socket_id: string;
      }>(contact.contact_id);

      if (!connectedUser) continue;

      socket.volatile
        .to(connectedUser.socket_id)
        .emit("online", { userId, isOnline: false });
    }
  });
}
