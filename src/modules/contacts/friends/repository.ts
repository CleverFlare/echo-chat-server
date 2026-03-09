import { InferSchema } from "@/cql/types";
import { Option, Result } from "@/utils/rust-types";
import { friendRequests, friendRequestsBySenderId, friends } from "../schema";
import { AppError } from "@/utils/errors";

export async function findFriendRequests(
  userId: string,
): Promise<Result<InferSchema<typeof friendRequests>[], AppError>> {
  try {
    const requests = await friendRequests
      .select("*")
      .where("receiverId", "=", userId)
      .build()
      .execute();

    return Result.Ok(requests);
  } catch (err) {
    return Result.Err(AppError.from(err as Error));
  }
}

export async function findFriendRequest(
  userId: string,
  personId: string,
): Promise<Result<InferSchema<typeof friendRequests>, AppError>> {
  try {
    const requests = await friendRequests
      .select("*")
      .where("receiverId", "=", userId)
      .where("senderId", "=", personId)
      .build()
      .execute();

    return Result.Ok(requests[0]);
  } catch (err) {
    return Result.Err(AppError.from(err as Error));
  }
}

export async function findFriendResponses(
  userId: string,
): Promise<Result<InferSchema<typeof friendRequestsBySenderId>[], AppError>> {
  try {
    const responses = await friendRequestsBySenderId
      .select("*")
      .where("senderId", "=", userId)
      .build()
      .execute();

    return Result.Ok(responses);
  } catch (err) {
    return Result.Err(AppError.from(err as Error));
  }
}

export async function findFriendResponse(
  userId: string,
  personId: string,
): Promise<Result<InferSchema<typeof friendRequestsBySenderId>, AppError>> {
  try {
    const responses = await friendRequestsBySenderId
      .select("*")
      .where("senderId", "=", userId)
      .where("receiverId", "=", personId)
      .build()
      .execute();

    return Result.Ok(responses[0]);
  } catch (err) {
    return Result.Err(AppError.from(err as Error));
  }
}

export async function findFriends(
  userId: string,
): Promise<Result<InferSchema<typeof friends>[], AppError>> {
  try {
    const results = await friends
      .select("*")
      .where("userId", "=", userId)
      .build()
      .execute();

    return Result.Ok(results);
  } catch (err) {
    return Result.Err(AppError.from(err as Error));
  }
}

export async function findFriend(
  userId: string,
  friendId: string,
): Promise<Result<Option<InferSchema<typeof friends>>, AppError>> {
  try {
    const results = await friends
      .select("*")
      .where("userId", "=", userId)
      .where("friendId", "=", friendId)
      .build()
      .execute();

    if (results[0] === undefined) {
      return Result.Ok(Option.None());
    }

    return Result.Ok(Option.Some(results[0]));
  } catch (err) {
    return Result.Err(AppError.from(err as Error));
  }
}

export async function insertFriendRequest(
  userId: string,
  personId: string,
): Promise<Result<void, AppError>> {
  try {
    await friendRequests
      .insert({
        createdAt: new Date(),
        receiverId: personId,
        senderId: userId,
        status: "pending",
      })
      .build()
      .execute();

    await friendRequestsBySenderId
      .insert({
        createdAt: new Date(),
        receiverId: personId,
        senderId: userId,
        status: "pending",
      })
      .build()
      .execute();

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(AppError.from(err as Error));
  }
}

export async function insertFriend(
  userId: string,
  friendId: string,
): Promise<Result<void, AppError>> {
  try {
    await friends
      .insert({
        userId: userId,
        friendId: friendId,
        createdAt: new Date(),
      })
      .build()
      .execute();

    await friends
      .insert({
        userId: friendId,
        friendId: userId,
        createdAt: new Date(),
      })
      .build()
      .execute();

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(AppError.from(err as Error));
  }
}

export async function removeFriend(
  userId: string,
  friendId: string,
): Promise<Result<void, AppError>> {
  try {
    await friends
      .delete()
      .where("friendId", "=", friendId)
      .where("userId", "=", userId)
      .build()
      .execute();

    await friends
      .delete()
      .where("friendId", "=", userId)
      .where("userId", "=", friendId)
      .build()
      .execute();

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(AppError.from(err as Error));
  }
}

export async function removeFriendRequest(
  userId: string,
  personId: string,
): Promise<Result<void, AppError>> {
  try {
    await friendRequests
      .delete()
      .where("senderId", "=", userId)
      .where("receiverId", "=", personId)
      .build()
      .execute();

    await friendRequestsBySenderId
      .delete()
      .where("senderId", "=", userId)
      .where("receiverId", "=", personId)
      .build()
      .execute();

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(AppError.from(err as Error));
  }
}

export async function updateFriendRequestStatus(
  userId: string,
  personId: string,
  status: "pending" | "rejected" | "accepted",
): Promise<Result<void, AppError>> {
  try {
    await friendRequests
      .update()
      .set("status", status)
      .where("senderId", "=", userId)
      .where("receiverId", "=", personId)
      .build()
      .execute();

    await friendRequestsBySenderId
      .update()
      .set("status", status)
      .where("senderId", "=", userId)
      .where("receiverId", "=", personId)
      .build()
      .execute();

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(AppError.from(err as Error));
  }
}
