import { authMiddleware } from "@/utils/auth";
import Elysia from "elysia";
import z from "zod/v4";
import { sendFriendRequest } from "./send-friend-request.service";
import logger from "@/utils/logger";
import { subscribe } from "@/event-bus";
import { getFriends } from "./get-friends.service";
import { getFriendRequests } from "./get-friend-requests.service";
import {
  acceptFriendRequest,
  deleteFriendRequest,
  rejectFriendRequest,
} from "./friend-request-status.service";
import { unfriend } from "./unfriend.service";

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
  .get(
    "/friends/requests",
    async ({ user, status }) => {
      const friendRequestsResult = await getFriendRequests(user.id);

      if (friendRequestsResult.isErr()) {
        logger.error(friendRequestsResult.unwrapErr().message);

        return status("Internal Server Error", "Internal Server Error");
      }

      return status("OK", friendRequestsResult.unwrap());
    },
    { auth: true },
  ) // list incoming + outgoing requests
  .ws("/friend/requests", {
    open({ data: { user }, send }) {
      subscribe(
        "friend.request.received:[id]",
        { id: user.id },
        async (user) => {
          send(user.payload);
        },
      );

      subscribe(
        "friend.request.responded:[id]",
        { id: user.id },
        async (user) => {
          send(user.payload);
        },
      );
    },
    auth: true,
  })
  .delete(
    "/friends/request/:userId",
    async ({ user, params: { userId }, status }) => {
      const result = await deleteFriendRequest(user.id, userId);

      if (result.isErr()) {
        logger.error(result.unwrapErr().message);
        return status("Internal Server Error", "Internal Server Error");
      }

      return status("OK", "Deleted");
    },
    { auth: true },
  ) // cancel an outgoing request
  .post(
    "/friends/requests/:userId/accept",
    async ({ user, status, params: { userId } }) => {
      const result = await acceptFriendRequest(user.id, userId);

      if (result.isErr()) {
        logger.error(result.unwrapErr().message);
        return status("Internal Server Error", "Internal Server Error");
      }

      return status("OK", "Accepted");
    },
    { auth: true },
  )
  .post(
    "/friends/requests/:userId/decline",
    async ({ user, status, params: { userId } }) => {
      const result = await rejectFriendRequest(user.id, userId);

      if (result.isErr()) {
        logger.error(result.unwrapErr().message);
        return status("Internal Server Error", "Internal Server Error");
      }

      return status("OK", "Rejected");
    },
    { auth: true },
  )
  .delete(
    "/friends/:userId",
    async ({ user, params: { userId }, status }) => {
      const result = await unfriend(user.id, userId);

      if (result.isErr()) {
        logger.error(result.unwrapErr().message);

        return status("Internal Server Error", "Internal Server Error");
      }

      return status("OK", "Unfriended");
    },
    { auth: true },
  ); // unfriend (moves them to people)
