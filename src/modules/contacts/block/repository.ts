import { Option, Result } from "@/utils/rust-types";
import { blocks } from "../schema";
import { InferSchema } from "@/cql/types";

export async function insertBlock(
  userId: string,
  personId: string,
): Promise<Result<void, Error>> {
  try {
    await blocks
      .insert({
        createdAt: new Date(),
        blockerId: userId,
        blockedId: personId,
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
      .where("blockerId", "=", userId)
      .where("blockedId", "=", personId)
      .build()
      .execute();

    return Result.Ok(undefined);
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
      .where("blockerId", "=", userId)
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
      .where("blockerId", "=", userId)
      .where("blockedId", "=", personId)
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
