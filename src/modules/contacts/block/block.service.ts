import { Result } from "@/utils/rust-types";
import { findBlock, insertBlock } from "./repository";

export async function blockPerson(
  userId: string,
  personId: string,
): Promise<Result<void, Error>> {
  const isAlreadyBlockedResult = await findBlock(userId, personId);

  if (isAlreadyBlockedResult.isErr()) {
    return Result.Err(isAlreadyBlockedResult.unwrapErr());
  }

  if (isAlreadyBlockedResult.unwrap().isSome()) {
    return Result.Ok(undefined);
  }

  return (await insertBlock(userId, personId)).match({
    Ok: () => Result.Ok(undefined),
    Err: (error) => Result.Err(error),
  });
}
