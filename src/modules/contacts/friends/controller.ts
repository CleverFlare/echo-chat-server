import { authMiddleware } from "@/utils/auth";
import Elysia from "elysia";
import z from "zod/v4";
import { sendFriendRequest } from "./send-friend-request.service";
import logger from "@/utils/logger";
import { subscribe } from "@/event-bus";
import { getUserById } from "@/modules/auth/user.service";
import { getFriends } from "./get-friends.service";

export const friendsController = new Elysia()
  .use(authMiddleware)
  .get(
    "/friends",
    async ({ user, status }) => {
      const friendsResult = await getFriends(user.id);

      if (friendsResult.isErr()) {
        logger.error(friendsResult.unwrapErr().message);

        return status("Internal Server Error", "Internal Server Error");
      }

      return status("OK", friendsResult.unwrap());
    },
    { auth: true },
  ) // list all friends
  .post(
    "/friends/requests",
    async ({ body: { via, value }, user, status }) => {
      const friendRequest = await sendFriendRequest(user.id, via, value);

      if (friendRequest.isErr()) {
        logger.error(friendRequest.unwrapErr().message);

        status("Internal Server Error", "Internal Server Error");
      }

      status("OK", friendRequest.unwrap());
    },
    {
      auth: true,
      body: z.object({
        via: z.enum(["email", "handle", "id", "phone"]),
        value: z.string(),
      }),
    },
  ) // send a friend request
  .get("/friends/requests", () => {}, { auth: true }) // list incoming + outgoing requests
  .ws("/friend-requests", {
    open({ data: { user }, send }) {
      subscribe("new-friend-request:[id]", { id: user.id }, async (user) => {
        const userResult = await getUserById(user.senderId);

        if (userResult.isOk()) {
          send(userResult.unwrap());
        }
      });
    },
    auth: true,
  })
  .delete("/friends/request/:userId", () => {}, { auth: true }) // cancel an outgoing request
  .post("/friends/requests/:userId/accept", () => {}, { auth: true })
  .post("/friends/requests/:userId/decline", () => {}, { auth: true })
  .delete("/friends/:userId", () => {}, { auth: true }); // unfriend (moves them to people)
