import { InferSchema } from "@/cql/types";
import { userByEmail, userByHandle, userById, userByPhone } from "./schema";
import { Option, Result } from "@/utils/rust-types";
import { AppError } from "@/utils/errors";

type UserById = typeof userById;

export async function findUserById(
  id: string,
): Promise<Result<Option<InferSchema<UserById>>, AppError>> {
  try {
    const results = await userById
      .select("*")
      .where("id", "=", id)
      .build()
      .execute();

    if (results.length === 0 || results[0] === undefined) {
      return Result.Ok(Option.None());
    }

    const user = results[0];

    return Result.Ok(Option.Some(user));
  } catch (err) {
    return Result.Err(err as AppError<"server">);
  }
}

export async function findUserIdByHandle(
  handle: string,
): Promise<Result<Option<InferSchema<typeof userByHandle>>, AppError>> {
  try {
    const results = await userByHandle
      .select("*")
      .where("handle", "=", handle)
      .build()
      .execute();

    if (results.length === 0 || results[0] === undefined) {
      return Result.Ok(Option.None());
    }

    const user = results[0];

    return Result.Ok(Option.Some(user));
  } catch (err) {
    return Result.Err(err as AppError<"server">);
  }
}

export async function findUserIdByEmail(
  email: string,
): Promise<Result<Option<InferSchema<typeof userByEmail>>, AppError>> {
  try {
    const results = await userByEmail
      .select("*")
      .where("email", "=", email)
      .build()
      .execute();

    if (results.length === 0 || results[0] === undefined) {
      return Result.Ok(Option.None());
    }

    const user = results[0];

    return Result.Ok(Option.Some(user));
  } catch (err) {
    return Result.Err(err as AppError<"server">);
  }
}

export async function findUserIdByPhone(
  email: string,
): Promise<Result<Option<InferSchema<typeof userByPhone>>, AppError>> {
  try {
    const results = await userByPhone
      .select("*")
      .where("phone", "=", email)
      .build()
      .execute();

    if (results.length === 0 || results[0] === undefined) {
      return Result.Ok(Option.None());
    }

    const user = results[0];

    return Result.Ok(Option.Some(user));
  } catch (err) {
    return Result.Err(err as AppError<"server">);
  }
}

export async function insertUser(
  user: InferSchema<UserById>,
): Promise<Result<Option<never>, AppError>> {
  try {
    await userById.insert(user).build().execute();

    await userByEmail.insert(user).build().execute();

    await userByPhone.insert(user).build().execute();

    return Result.Ok(Option.None());
  } catch (err) {
    return Result.Err(err as AppError<"server">);
  }
}

export async function removeUser(
  id: string,
): Promise<Result<Option<never>, AppError>> {
  try {
    const userRecord = await userById
      .select()
      .where("id", "=", id)
      .build()
      .execute();

    await userById.delete().where("id", "=", id).build().execute();

    await userByPhone
      .delete()
      .where("phone", "=", userRecord[0].phone)
      .build()
      .execute();

    await userByEmail
      .delete()
      .where("email", "=", userRecord[0].email)
      .build()
      .execute();

    return Result.Ok(Option.None());
  } catch (err) {
    return Result.Err(err as AppError<"server">);
  }
}

export async function updateUser(
  id: string,
  user: Partial<Omit<InferSchema<UserById>, "created_at" | "id">>,
): Promise<Result<Option<never>, AppError>> {
  try {
    const userRecord = await userById
      .select()
      .where("id", "=", id)
      .build()
      .execute();

    if (!userRecord[0])
      return Result.Err(
        AppError.client(
          `User with ID (${id}) does not exist. Can't update its data.`,
        ),
      );

    const filteredInput = Object.entries(user)
      // eslint-disable-next-line
      .filter(([_, value]) => value !== undefined)
      .reduce<Partial<Omit<InferSchema<UserById>, "created_at" | "id">>>(
        (prev, [key, value]) => ({ ...prev, [key]: value }),
        {},
      );

    if (Object.keys(filteredInput).length === 0) {
      return Result.Ok(Option.None());
    }

    const data: InferSchema<UserById> = {
      ...userRecord[0],
      ...filteredInput,
    };

    const updates: Promise<void>[] = [
      userById.update().setMany(data).where("id", "=", id).build().execute(),
    ];

    if (user.email) {
      updates.push(
        userByEmail
          .delete()
          .where("email", "=", userRecord[0].email)
          .build()
          .execute(),
        userByEmail.insert(data).build().execute(),
      );
    } else {
      updates.push(
        userByEmail
          .update()
          .setMany(data)
          .where("email", "=", userRecord[0].email)
          .build()
          .execute(),
      );
    }

    if (user.phone) {
      updates.push(
        userByPhone
          .delete()
          .where("phone", "=", userRecord[0].phone)
          .build()
          .execute(),
        userByPhone.insert(data).build().execute(),
      );
    } else {
      updates.push(
        userByPhone
          .update()
          .setMany(data)
          .where("phone", "=", userRecord[0].phone)
          .build()
          .execute(),
      );
    }

    const results = await Promise.allSettled(updates);

    const failed = results.filter((r) => r.status === "rejected");

    if (failed.length > 0) {
      // log, compensate, or return a specific error
      return Result.Err(
        AppError.server(failed.map((failure) => failure.reason).join(" - ")),
      );
    }

    return Result.Ok(Option.None());
  } catch (err) {
    return Result.Err(err as AppError<"server">);
  }
}
