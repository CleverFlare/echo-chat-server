import { AppError } from "@/shared/app-error";
import {
  findConnectedUserByUserId,
  getUserByUsername,
} from "../auth/auth.repository";
import { insertContact } from "./contacts.repository";
import { StatusCodes } from "http-status-codes";
import { getUserById } from "../profile/profile.repository";
import { io } from "@/shared/socket";

export async function addContact(username: string, userId: string) {
  const user = await getUserByUsername<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    username: string;
    avatar_url: string;
  }>(username);

  const me = await getUserById<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    username: string;
    avatar_url: string;
  }>(userId);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User was not found");
  }

  if (!me) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Are you sure you're logged in properly?",
    );
  }

  const contact = await insertContact<{
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
  }>({
    userId,
    contactId: user.id,
    avatarUrl: user.avatar_url,
    username: user.username,
    lastName: user.last_name,
    firstName: user.first_name,
  });

  const otherPartyContact = await insertContact<{
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
  }>({
    userId: contact.contact_id,
    contactId: me.id,
    avatarUrl: me.avatar_url,
    username: me.username,
    lastName: me.last_name,
    firstName: me.first_name,
    chatId: contact.chat_id,
  });

  const connectedOtherParty = await findConnectedUserByUserId<
    { socket_id: string; user_id: string } | undefined | null
  >(contact.contact_id);

  const connectedUser = await findConnectedUserByUserId<
    { socket_id: string; user_id: string } | undefined | null
  >(contact.user_id);

  if (connectedOtherParty) {
    io.to(connectedOtherParty.socket_id).emit("new-contact", {
      id: otherPartyContact.contact_id,
      firstName: otherPartyContact.first_name,
      lastName: otherPartyContact.last_name,
      username: otherPartyContact.username,
      avatarUrl: otherPartyContact.avatar_url,
      chatId: otherPartyContact.chat_id,
      unread: otherPartyContact.unread,
      lastMessage: otherPartyContact.last_message,
      isOnline: !!connectedUser,
    });
  }

  return {
    id: contact.contact_id,
    firstName: contact.first_name,
    lastName: contact.last_name,
    username: contact.username,
    avatarUrl: contact.avatar_url,
    chatId: contact.chat_id,
    unread: contact.unread,
    lastMessage: contact.last_message,
  };
}
