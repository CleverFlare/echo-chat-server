import { Option, Result } from "@/utils/rust-types";
import {
  people,
  friends,
  friendRequests,
  friendRequestsBySenderId,
  chats,
  blocks,
} from "./schema";
import { InferSchema } from "@/cql/types";
import { randomUUIDv7 } from "bun";

export async function findChats(
  userId: string,
): Promise<Result<InferSchema<typeof chats>[], Error>> {
  try {
    const chatsQuery = await chats
      .select("*")
      .where("user_id", "=", userId)
      .build()
      .execute();

    return Result.Ok(chatsQuery);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function findBlocks(
  userId: string,
): Promise<Result<InferSchema<typeof blocks>[], Error>> {
  try {
    const requests = await blocks
      .select("*")
      .where("blocker_id", "=", userId)
      .build()
      .execute();

    return Result.Ok(requests);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function findBlock(
  userId: string,
  personId: string,
): Promise<Result<Option<InferSchema<typeof blocks>>, Error>> {
  try {
    const requests = await blocks
      .select("*")
      .where("blocker_id", "=", userId)
      .where("blocked_id", "=", personId)
      .build()
      .execute();

    if (requests[0] === undefined) {
      return Result.Ok(Option.None());
    }

    return Result.Ok(Option.Some(requests[0]));
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function findFriendRequests(
  userId: string,
): Promise<Result<InferSchema<typeof friendRequests>[], Error>> {
  try {
    const requests = await friendRequests
      .select("*")
      .where("receiver_id", "=", userId)
      .build()
      .execute();

    return Result.Ok(requests);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function findFriendRequest(
  userId: string,
  personId: string,
): Promise<Result<InferSchema<typeof friendRequests>, Error>> {
  try {
    const requests = await friendRequests
      .select("*")
      .where("receiver_id", "=", userId)
      .where("sender_id", "=", personId)
      .build()
      .execute();

    return Result.Ok(requests[0]);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function findFriendResponses(
  userId: string,
): Promise<Result<InferSchema<typeof friendRequestsBySenderId>[], Error>> {
  try {
    const responses = await friendRequestsBySenderId
      .select("*")
      .where("sender_id", "=", userId)
      .build()
      .execute();

    return Result.Ok(responses);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function findFriendResponse(
  userId: string,
  personId: string,
): Promise<Result<InferSchema<typeof friendRequestsBySenderId>, Error>> {
  try {
    const responses = await friendRequestsBySenderId
      .select("*")
      .where("sender_id", "=", userId)
      .where("receiver_id", "=", personId)
      .build()
      .execute();

    return Result.Ok(responses[0]);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function findPeopleByUserId(
  id: string,
): Promise<Result<InferSchema<typeof people>[], Error>> {
  try {
    const users = await people
      .select("*")
      .where("owner_id", "=", id)
      .build()
      .execute();

    return Result.Ok(users);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function findFriends(
  userId: string,
): Promise<Result<InferSchema<typeof friends>[], Error>> {
  try {
    const results = await friends
      .select("*")
      .where("user_id", "=", userId)
      .build()
      .execute();

    return Result.Ok(results);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function findFriend(
  userId: string,
  friendId: string,
): Promise<Result<Option<InferSchema<typeof friends>>, Error>> {
  try {
    const results = await friends
      .select("*")
      .where("user_id", "=", userId)
      .where("friend_id", "=", friendId)
      .build()
      .execute();

    if (results[0] === undefined) {
      return Result.Ok(Option.None());
    }

    return Result.Ok(Option.Some(results[0]));
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function insertChat(
  userId: string,
  otherPartyId: string,
  lastMessage: { content: string; createdAt: Date },
) {
  try {
    const chatId = randomUUIDv7();

    const isFriend = (await findFriend(userId, otherPartyId)).match({
      Ok: (option) => option.match({ Some: () => true, None: () => false }),
      Err: (error) => {
        throw error;
      },
    });

    await chats
      .insert({
        chat_id: chatId,
        is_friend: isFriend,
        last_message: lastMessage.content,
        last_message_at: lastMessage.createdAt,
        other_user_id: otherPartyId,
        user_id: userId,
      })
      .build()
      .execute();

    return Result.Ok(null);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function insertFriendRequest(
  userId: string,
  personId: string,
): Promise<Result<void, Error>> {
  try {
    await friendRequests
      .insert({
        created_at: new Date(),
        receiver_id: personId,
        sender_id: userId,
        status: "pending",
      })
      .build()
      .execute();

    await friendRequestsBySenderId
      .insert({
        created_at: new Date(),
        receiver_id: personId,
        sender_id: userId,
        status: "pending",
      })
      .build()
      .execute();

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function insertBlock(
  userId: string,
  personId: string,
): Promise<Result<void, Error>> {
  try {
    await blocks
      .insert({
        created_at: new Date(),
        blocker_id: userId,
        blocked_id: personId,
      })
      .build()
      .execute();

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function removeBlock(
  userId: string,
  personId: string,
): Promise<Result<void, Error>> {
  try {
    await blocks
      .delete()
      .where("blocker_id", "=", userId)
      .where("blocked_id", "=", personId)
      .build()
      .execute();

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function insertFriend(
  userId: string,
  friendId: string,
): Promise<Result<void, Error>> {
  try {
    await friends
      .insert({
        user_id: userId,
        friend_id: friendId,
        created_at: new Date(),
      })
      .build()
      .execute();

    await friends
      .insert({
        user_id: friendId,
        friend_id: userId,
        created_at: new Date(),
      })
      .build()
      .execute();

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function removeFriend(
  userId: string,
  friendId: string,
): Promise<Result<void, Error>> {
  try {
    await friends
      .delete()
      .where("friend_id", "=", friendId)
      .where("user_id", "=", userId)
      .build()
      .execute();

    await friends
      .delete()
      .where("friend_id", "=", userId)
      .where("user_id", "=", friendId)
      .build()
      .execute();

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function removeFriendRequest(
  userId: string,
  personId: string,
): Promise<Result<void, Error>> {
  try {
    await friendRequests
      .delete()
      .where("sender_id", "=", userId)
      .where("receiver_id", "=", personId)
      .build()
      .execute();

    await friendRequestsBySenderId
      .delete()
      .where("sender_id", "=", userId)
      .where("receiver_id", "=", personId)
      .build()
      .execute();

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function updateFriendRequestStatus(
  userId: string,
  personId: string,
  status: "pending" | "rejected" | "accepted",
): Promise<Result<void, Error>> {
  try {
    await friendRequests
      .update()
      .set("status", status)
      .where("sender_id", "=", userId)
      .where("receiver_id", "=", personId)
      .build()
      .execute();

    await friendRequestsBySenderId
      .update()
      .set("status", status)
      .where("sender_id", "=", userId)
      .where("receiver_id", "=", personId)
      .build()
      .execute();

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(err as Error);
  }
}
