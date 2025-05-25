import { Socket } from "socket.io";
import {
  findConnectedUserById,
  insertConnectedUser,
  insertMessage,
  InsertMessageType,
} from "./messages.repository";
import { jwtVerify } from "jose";
import { env } from "@/env";
import { updateContactLastMessage } from "../contacts/contacts.repository";

export async function setupMessagingSockets(socket: Socket) {
  if (!socket?.handshake?.headers?.authorization) {
    socket.disconnect();
    return;
  }

  console.log(
    "HANDSHAKE AUTHORIZATION",
    socket.handshake.headers.authorization,
  );

  const {
    payload: {
      data: { id },
    },
  } = await jwtVerify<{ data: { id: string } }>(
    socket.handshake.headers.authorization,
    new TextEncoder().encode(env.JWT_PRIVATE),
  );

  await insertConnectedUser({ userId: id, socketId: socket.id });

  socket.on(
    "send-message",
    async (recipientId: string, message: InsertMessageType) => {
      if (!message?.chatId) return;

      const insertedMessage = await insertMessage(message);

      await updateContactLastMessage({
        ...message,
        partyOneId: message.senderId,
        partyTwoId: recipientId,
      });

      const user = await findConnectedUserById<{
        user_id: string;
        socket_id: string;
      }>(recipientId);

      if (!user) return;

      socket.broadcast.to(user.socket_id).emit("receive-message", {
        chatId: insertedMessage.chat_id,
        id: insertedMessage.id,
        status: insertedMessage.status,
        content: insertedMessage.content,
        isEdited: insertedMessage.is_edited,
        senderId: insertedMessage.sender_id,
        timestamp: insertedMessage.timestamp,
      } as InsertMessageType);
    },
  );
}
