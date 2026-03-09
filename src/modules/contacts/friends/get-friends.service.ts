import { InferSchema } from "@/cql/types";
import { friends } from "../schema";
import { findFriends } from "./repository";
import { Result } from "@/utils/rust-types";
import { AppError } from "@/utils/errors";

export async function getFriends(
  userId: string,
): Promise<Result<InferSchema<typeof friends>[], AppError>> {
  return findFriends(userId);
}
