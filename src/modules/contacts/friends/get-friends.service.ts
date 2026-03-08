import { InferSchema } from "@/cql/types";
import { friends } from "../schema";
import { findFriends } from "./repository";
import { Result } from "@/utils/rust-types";

export async function getFriends(
  userId: string,
): Promise<Result<InferSchema<typeof friends>[], Error>> {
  return findFriends(userId);
}
