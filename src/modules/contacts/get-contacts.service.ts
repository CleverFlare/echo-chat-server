import { findContacts } from "./contacts.repository";

export async function getContacts(userId: string) {
  const contacts = (
    await findContacts<{
      user_id: string;
      contact_id: string;
      first_name: string;
      last_name: string;
      username: string;
      avatar_url: string;
      chat_id: string;
      unread: number;
      last_message: {
        id: string;
        content: string;
        timestamp: string;
        sender_id: string;
        status: string;
      };
    }>(userId)
  ).map((contact) => ({
    id: contact.contact_id,
    firstName: contact.first_name,
    lastName: contact.last_name,
    username: contact.username,
    avatarUrl: contact.avatar_url,
    chatId: contact.chat_id,
    lastMessage: contact?.last_message
      ? {
          ...contact.last_message,
          senderId: contact.last_message.sender_id,
        }
      : undefined,
    unread: contact.unread,
  }));

  return contacts;
}
