import { authMiddleware } from "@/utils/auth";
import Elysia from "elysia";
import { z } from "zod/v4";
import { publish, subscribe } from "@/event-bus";
import logger from "@/utils/logger";
import { getChatsByUserId } from "./chats.service";
import {
  blockPerson,
  sendFriendRequestByEmail,
  sendFriendRequestByHandle,
  sendFriendRequestById,
  sendFriendRequestByPhone,
} from "./friends.service";
import {
  getUserById,
  getUserIdByEmail,
  getUserIdByHandle,
  getUserIdByPhone,
} from "../auth/user.service";

export const contactsRouter = new Elysia()
  .use(authMiddleware)
  .get(
    "/chats",
    async ({ user, status }) => {
      const chats = await getChatsByUserId(user.id);

      if (chats.isErr()) {
        logger.error(chats.unwrapErr().message);

        return status(
          "Internal Server Error",
          "Please check the server logs for details",
        );
      }

      return status("OK", chats.unwrap());
    },
    { auth: true },
  )
  .post(
    "/add-friend-by-phone",
    async ({ user, body: { phone }, status }) => {
      const addFriendResult = await sendFriendRequestByPhone(user.id, phone);

      if (addFriendResult.isErr()) {
        logger.error(addFriendResult.unwrapErr().message);

        return status(
          "Internal Server Error",
          "Please check the server logs for details",
        );
      }

      const personIdResult = await getUserIdByPhone(phone);

      if (personIdResult.isOk()) {
        const id = personIdResult.unwrap();

        publish("new-friend-requests:[id]", { id }, addFriendResult.unwrap());
      }

      return status("OK", "Added successfully");
    },
    { auth: true, body: z.object({ phone: z.string() }) },
  )
  .post(
    "/add-friend-by-email",
    async ({ user, body: { email }, status }) => {
      const addFriendResult = await sendFriendRequestByEmail(user.id, email);

      if (addFriendResult.isErr()) {
        logger.error(addFriendResult.unwrapErr().message);

        return status(
          "Internal Server Error",
          "Please check the server logs for details",
        );
      }

      const personIdResult = await getUserIdByEmail(email);

      if (personIdResult.isOk()) {
        const id = personIdResult.unwrap();

        publish("new-friend-requests:[id]", { id }, addFriendResult.unwrap());
      }

      return status("OK", "Added successfully");
    },
    { auth: true, body: z.object({ email: z.string() }) },
  )
  .post(
    "/add-friend-by-handle",
    async ({ user, body: { handle }, status }) => {
      const addFriendResult = await sendFriendRequestByHandle(user.id, handle);

      if (addFriendResult.isErr()) {
        logger.error(addFriendResult.unwrapErr().message);

        return status(
          "Internal Server Error",
          "Please check the server logs for details",
        );
      }

      const personIdResult = await getUserIdByHandle(handle);

      if (personIdResult.isOk()) {
        const id = personIdResult.unwrap();

        publish("new-friend-requests:[id]", { id }, addFriendResult.unwrap());
      }

      return status("OK", "Added successfully");
    },
    { auth: true, body: z.object({ handle: z.string() }) },
  )
  .post(
    "/add-friend-by-id",
    async ({ user, body: { id }, status }) => {
      const addFriendResult = await sendFriendRequestById(user.id, id);

      if (addFriendResult.isErr()) {
        logger.error(addFriendResult.unwrapErr().message);

        return status(
          "Internal Server Error",
          "Please check the server logs for details",
        );
      }

      publish("new-friend-requests:[id]", { id }, addFriendResult.unwrap());

      return status("OK", "Added successfully");
    },
    { auth: true, body: z.object({ id: z.string() }) },
  )
  .post(
    "/block",
    async ({ user, body: { userId }, status }) => {
      const blockResult = await blockPerson(user.id, userId);

      if (blockResult.isErr()) {
        logger.error(blockResult.unwrapErr().message);

        return status(
          "Internal Server Error",
          "Please check the server logs for details",
        );
      }

      return status("OK", { userId });
    },
    {
      auth: true,
      body: z.object({ userId: z.string() }),
    },
  )
  .ws("/new-friend-request", {
    open({ data: { user }, send }) {
      subscribe("new-friend-requests:[id]", { id: user.id }, async (user) => {
        const userResult = await getUserById(user.senderId);

        if (userResult.isOk()) {
          send(userResult.unwrap());
        }
      });
    },
    auth: true,
  });
