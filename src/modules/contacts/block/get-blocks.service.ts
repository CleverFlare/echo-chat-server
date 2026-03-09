import { Result } from "@/utils/rust-types";
import { findBlocks } from "./repository";
import { InferSchema } from "@/cql/types";
import { AppError } from "@/utils/errors";
import { blocks } from "../schema";

type Blocks = typeof blocks;

export async function getBlocks(
  userId: string,
): Promise<Result<InferSchema<Blocks>[], AppError>> {
  const result = await findBlocks(userId);

  if (result.isErr()) {
    return Result.Err(result.unwrapErr());
  }

  const blocks = result.unwrap();

  return Result.Ok(blocks);
}
