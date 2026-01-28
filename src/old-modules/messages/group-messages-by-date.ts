import { format } from "date-fns";
import { Message } from "./messages.schema";
import { InsertMessageType } from "./messages.repository";

export function groupMessagesByDate(
  messages: Message[],
): Record<string, InsertMessageType[]> {
  return messages.reduce<
    Record<
      string,
      {
        id: string;
        chatId: string;
        content: string;
        timestamp: string;
        senderId: string;
        isEdited: boolean;
        status: string;
      }[]
    >
  >((acc, message) => {
    const dateKey = format(new Date(message.timestamp), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push({
      id: message.id,
      chatId: message.chat_id,
      content: message.content,
      timestamp: message.timestamp,
      senderId: message.sender_id,
      isEdited: message.is_edited,
      status: message.status,
    });
    return acc;
  }, {});
}
