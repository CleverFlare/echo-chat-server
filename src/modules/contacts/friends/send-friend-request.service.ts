import { InferSchema } from "@/cql/types";
import { Result } from "@/utils/rust-types";
import { friendRequests } from "../schema";
import {
  getUserById,
  getUserIdByEmail,
  getUserIdByHandle,
  getUserIdByPhone,
} from "@/modules/auth/user.service";
import { findFriendRequest, insertFriendRequest } from "./repository";
import { publish } from "@/event-bus";
import { AppError } from "@/utils/errors";

async function resolveUserId(
  via: "email" | "id" | "phone" | "handle",
  value: string,
): Promise<Result<string, AppError>> {
  switch (via) {
    case "email":
      return getUserIdByEmail(value);
    case "handle":
      return getUserIdByHandle(value);
    case "phone":
      return getUserIdByPhone(value);
    case "id": {
      const result = await getUserById(value);
      return result.match({
        Ok: (user) => Result.Ok(user.id),
        Err: (error) => Result.Err(error),
      });
    }
  }
}

export async function sendFriendRequest(
  senderId: string,
  via: "email" | "id" | "phone" | "handle",
  value: string,
): Promise<Result<InferSchema<typeof friendRequests>, AppError>> {
  const recipientResult = await resolveUserId(via, value);

  return recipientResult.match({
    Ok: async (recipientId) => {
      await insertFriendRequest(senderId, recipientId);
      const requestResult = await findFriendRequest(senderId, recipientId);

      return requestResult.match({
        Ok: async (friendRequest) => {
          publish(
            "friend.request.received:[id]",
            { id: friendRequest.senderId },
            {
              payload: friendRequest,
              version: 1,
              event: "friend.request.received",
              occurredAt: new Date().toISOString(),
            },
          );

          return Result.Ok(friendRequest);
        },
        Err: async (error) => Result.Err(error),
      });
    },
    Err: async (error) => Result.Err(error),
  });
}
