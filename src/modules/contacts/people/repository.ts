import { InferSchema } from "@/cql/types";
import { Result } from "@/utils/rust-types";
import { people } from "../schema";
import { AppError } from "@/utils/errors";

export async function findPeopleByUserId(
  id: string,
): Promise<Result<InferSchema<typeof people>[], AppError>> {
  try {
    const users = await people
      .select("*")
      .where("ownerId", "=", id)
      .build()
      .execute();

    return Result.Ok(users);
  } catch (err) {
    return Result.Err(AppError.from(err as Error));
  }
}

export async function insertPerson(
  person: InferSchema<typeof people>,
): Promise<Result<void, AppError>> {
  try {
    await people.insert(person).build().execute();

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(AppError.from(err as Error));
  }
}

export async function removePerson(
  userId: string,
  personId: string,
): Promise<Result<void, AppError>> {
  try {
    await people
      .delete()
      .where("ownerId", "=", userId)
      .where("contactId", "=", personId)
      .build()
      .execute();

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(AppError.from(err as Error));
  }
}
