import { Option, Result } from "@/utils/rust-types";
import { blocks } from "../schema";
import { InferSchema } from "@/cql/types";
import { AppError } from "@/utils/errors";

export async function insertBlock(
  userId: string,
  personId: string,
): Promise<Result<void, AppError>> {
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
    return Result.Err(err as AppError<"server">);
  }
}

export async function removeBlock(
  userId: string,
  personId: string,
): Promise<Result<void, AppError>> {
  try {
    await blocks
      .delete()
      .where("blockerId", "=", userId)
      .where("blockedId", "=", personId)
      .build()
      .execute();

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(err as AppError<"server">);
  }
}

export async function findBlocks(
  userId: string,
): Promise<Result<InferSchema<typeof blocks>[], AppError>> {
  try {
    const requests = await blocks
      .select("*")
      .where("blockerId", "=", userId)
      .build()
      .execute();

    return Result.Ok(requests);
  } catch (err) {
    return Result.Err(err as AppError<"server">);
  }
}

export async function findBlock(
  userId: string,
  personId: string,
): Promise<Result<Option<InferSchema<typeof blocks>>, AppError>> {
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
    return Result.Err(err as AppError<"server">);
  }
}
