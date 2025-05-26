import { Socket } from "socket.io";
import { updateContactLastMessage } from "../contacts/contacts.repository";
import { findConnectedUserByUserId } from "../auth/auth.repository";
import { insertMessage, InsertMessageType } from "./messages.repository";

export async function setupMessagingSockets(socket: Socket) {
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

      const user = await findConnectedUserByUserId<{
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
