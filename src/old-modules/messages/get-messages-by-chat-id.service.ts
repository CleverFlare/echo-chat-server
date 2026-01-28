import { groupMessagesByDate } from "./group-messages-by-date";
import { findMessagesByChatId, InsertMessageType } from "./messages.repository";

type Message = {
  chat_id: string;
  timestamp: string;
  id: string;
  content: string;
  sender_id: string;
  status: string;
  is_edited: boolean;
};

export async function getMessagesByChatId(chatId: string) {
  const messages = await findMessagesByChatId<Message>(chatId);

  const groupedMessages: Record<string, InsertMessageType[]> =
    groupMessagesByDate(messages.reverse());

  return groupedMessages;
}
