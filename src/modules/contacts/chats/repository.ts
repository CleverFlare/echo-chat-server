import { InferSchema } from "@/cql/types";
import { Result } from "@/utils/rust-types";
import { chats } from "../schema";
import { randomUUIDv7 } from "bun";
import { findFriend } from "../friends/repository";
import { AppError } from "@/utils/errors";

export async function insertChat(
  userId: string,
  otherPartyId: string,
  lastMessage: { content: string; createdAt: Date },
): Promise<Result<void, AppError>> {
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
        chatId: chatId,
        isFriend: isFriend,
        lastMessage: lastMessage.content,
        lastMessageAt: lastMessage.createdAt,
        otherUserId: otherPartyId,
        userId: userId,
      })
      .build()
      .execute();

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(AppError.from(err as Error));
  }
}

export async function findChats(
  userId: string,
): Promise<Result<InferSchema<typeof chats>[], AppError>> {
  try {
    const chatsQuery = await chats
      .select("*")
      .where("userId", "=", userId)
      .build()
      .execute();

    return Result.Ok(chatsQuery);
  } catch (err) {
    return Result.Err(AppError.from(err as Error));
  }
}
