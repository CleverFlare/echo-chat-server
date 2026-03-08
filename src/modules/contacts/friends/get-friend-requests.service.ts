import { Result } from "@/utils/rust-types";
import { findFriendRequests, findFriendResponses } from "./repository";
import { InferSchema } from "@/cql/types";
import { friendRequests, friendRequestsBySenderId } from "../schema";

export async function getFriendRequests(userId: string): Promise<
  Result<
    {
      incoming: InferSchema<typeof friendRequests>[];
      outgoing: InferSchema<typeof friendRequestsBySenderId>[];
    },
    Error
  >
> {
  const incomingResult = await findFriendRequests(userId);

  if (incomingResult.isErr()) {
    return Result.Err(incomingResult.unwrapErr());
  }

  const result: {
    incoming: InferSchema<typeof friendRequests>[];
    outgoing: InferSchema<typeof friendRequestsBySenderId>[];
  } = {
    incoming: incomingResult.unwrap(),
    outgoing: [],
  };

  const outgoingResult = await findFriendResponses(userId);

  if (outgoingResult.isErr()) {
    return Result.Err(outgoingResult.unwrapErr());
  }

  result.outgoing = outgoingResult.unwrap();

  return Result.Ok(result);
}
