import { AppError } from "@/shared/app-error";
import { client } from "@/shared/database";
import { StatusCodes } from "http-status-codes";

type InsertContactType = {
  userId: string;
  contactId: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl?: string | null;
  chatId?: string | null;
};

export async function insertContact<T>(data: InsertContactType) {
  const chatId = data?.chatId ?? crypto.randomUUID();

  const params = [
    data.userId,
    data.contactId,
    data.firstName,
    data.lastName,
    data.username,
    data?.avatarUrl ?? null,
    chatId,
    0,
  ];

  await client.execute(
    "INSERT INTO user_contacts (user_id, contact_id, first_name, last_name, username, avatar_url, chat_id, unread) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    params,
    { prepare: true },
  );

  const contact = await client.execute(
    "SELECT * FROM user_contacts WHERE user_id=? AND contact_id=?",
    [data.userId, data.contactId],
    { prepare: true },
  );

  if (contact.rows.length <= 0) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Something went wrong while adding a contact",
    );
  }

  return contact.rows[0] as T;
}

export async function findContacts<T>(userId: string) {
  const params = [userId];

  const contact = await client.execute(
    "SELECT * FROM user_contacts WHERE user_id=?",
    params,
    { prepare: true },
  );

  return contact.rows as T[];
}
