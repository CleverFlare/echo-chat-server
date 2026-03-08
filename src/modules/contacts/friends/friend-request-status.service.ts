import { Result } from "@/utils/rust-types";
import { removeFriendRequest, updateFriendRequestStatus } from "./repository";
import { publish } from "@/event-bus";

export async function deleteFriendRequest(userId: string, personId: string) {
  return removeFriendRequest(userId, personId);
}

export async function acceptFriendRequest(
  userId: string,
  personId: string,
): Promise<Result<void, Error>> {
  return (await updateFriendRequestStatus(userId, personId, "accepted")).match({
    Ok: async () => {
      publish(
        "friend.request.responded:[id]",
        { id: personId },
        {
          payload: { userId, status: "accepted" },
          version: 1,
          occurredAt: new Date().toISOString(),
          event: "friend.request.responded",
        },
      );

      return Result.Ok(undefined);
    },
    Err: async (error) => Result.Err(error),
  });
}

export async function rejectFriendRequest(
  userId: string,
  personId: string,
): Promise<Result<void, Error>> {
  return (await updateFriendRequestStatus(userId, personId, "rejected")).match({
    Ok: async () => {
      publish(
        "friend.request.responded:[id]",
        { id: personId },
        {
          payload: { userId, status: "rejected" },
          version: 1,
          occurredAt: new Date().toISOString(),
          event: "friend.request.responded",
        },
      );

      return Result.Ok(undefined);
    },
    Err: async (error) => Result.Err(error),
  });
}
