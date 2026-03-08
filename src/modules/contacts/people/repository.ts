import { InferSchema } from "@/cql/types";
import { Result } from "@/utils/rust-types";
import { people } from "../schema";

export async function findPeopleByUserId(
  id: string,
): Promise<Result<InferSchema<typeof people>[], Error>> {
  try {
    const users = await people
      .select("*")
      .where("ownerId", "=", id)
      .build()
      .execute();

    return Result.Ok(users);
  } catch (err) {
    return Result.Err(err as Error);
  }
}
