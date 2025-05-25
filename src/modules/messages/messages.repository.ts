import { client } from "@/shared/database";
import { Message } from "./messages.schema";

export async function findMessagesByChatId<T>(chatId: string) {
  const data = await client.execute(
    "SELECT * FROM message_by_chat_id WHERE chat_id=? LIMIT 20",
    [chatId],
    { prepare: true },
  );

  return data.rows as T[];
}

export type InsertMessageType = {
  chatId: string;
  timestamp: string;
  content: string;
  senderId: string;
  status: string;
  isEdited: boolean;
  id: string;
};

export async function insertMessage<T extends Message>({
  chatId,
  status,
  isEdited,
  senderId,
  timestamp,
  content,
  id,
}: InsertMessageType) {
  const generatedId = id ?? crypto.randomUUID();

  await client.execute(
    "INSERT INTO message_by_chat_id (chat_id, timestamp, content, sender_id, status, is_edited, id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [chatId, timestamp, content, senderId, status, isEdited, generatedId],
    { prepare: true },
  );

  const data = await client.execute(
    "SELECT * FROM message_by_chat_id WHERE chat_id=? AND timestamp=?",
    [chatId, timestamp],
    { prepare: true },
  );

  return data.rows[0] as unknown as T;
}

export async function insertConnectedUser({
  userId,
  socketId,
}: {
  userId: string;
  socketId: string;
}) {
  await client.execute(
    "INSERT INTO connected_user_id (user_id, socket_id) VALUES (?, ?)",
    [userId, socketId],
    {
      prepare: true,
    },
  );
}

export async function findConnectedUserById<T>(userId: string) {
  const result = await client.execute(
    "SELECT * FROM connected_user_id WHERE user_id=?",
    [userId],
    { prepare: true },
  );

  return result.rows[0] as T;
}
