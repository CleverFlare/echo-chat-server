import { Result } from "@/utils/rust-types";
import { findChats } from "./repository";
import { AppError } from "@/utils/errors";
import { InferSchema } from "@/cql/types";
import { chats } from "../schema";

type Chats = typeof chats;

export async function getChatsByUserId(
  userId: string,
): Promise<Result<InferSchema<Chats>[], AppError>> {
  const chatsResult = await findChats(userId);

  if (chatsResult.isErr()) {
    return Result.Err(chatsResult.unwrapErr());
  }

  const chats = chatsResult.unwrap();

  return Result.Ok(chats);
}
