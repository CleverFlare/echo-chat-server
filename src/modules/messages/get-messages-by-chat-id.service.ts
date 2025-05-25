import { groupMessagesByDate } from "./group-messages-by-date";
import { findMessagesByChatId } from "./messages.repository";

export async function getMessagesByChatId(chatId: string) {
  const messages = await findMessagesByChatId<{
    chat_id: string;
    timestamp: string;
    id: string;
    content: string;
    sender_id: string;
    status: string;
    is_edited: boolean;
  }>(chatId);

  const groupedMessages = groupMessagesByDate(messages);

  return groupedMessages;
}
