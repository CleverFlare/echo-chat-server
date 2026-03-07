import { Result } from "@/utils/rust-types";
import { userById } from "./schema";
import { InferSchema } from "@/cql/types";
import {
  findUserById,
  findUserIdByEmail,
  findUserIdByHandle,
  findUserIdByPhone,
} from "./repository";

type UserById = typeof userById;

export async function getUserById(
  userId: string,
): Promise<Result<InferSchema<UserById>, Error>> {
  try {
    return (await findUserById(userId)).match({
      Ok: (option) =>
        option.match({
          Some: (user) => Result.Ok(user),
          None: () =>
            Result.Err(new Error(`User with ID of ${userId} was not found`)),
        }),
      Err: (error) => {
        throw error;
      },
    });
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function getUserByHandle(
  handle: string,
): Promise<Result<InferSchema<UserById>, Error>> {
  try {
    const userByHandleResult = await findUserIdByHandle(handle);

    return userByHandleResult.match({
      Ok: (userByHandleOption) =>
        userByHandleOption.match({
          Some: async (userByHandle) => {
            const userResult = await findUserById(userByHandle.id);

            return userResult.match({
              Ok: (userOption) =>
                userOption.match({
                  Some: (user) => Result.Ok(user),
                  None: () =>
                    Result.Err(
                      new Error(
                        "Could not locate a user with the ID tied to the handle",
                      ),
                    ),
                }),
              Err: (error) => Result.Err(error),
            });
          },
          None: async () =>
            Result.Err(new Error("User with this handle was not found")),
        }),
      Err: async (error) => Result.Err(error),
    });
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function getUserIdByHandle(
  handle: string,
): Promise<Result<string, Error>> {
  try {
    const userByHandleResult = await findUserIdByHandle(handle);

    return userByHandleResult.match({
      Ok: (userByHandleOption) =>
        userByHandleOption.match({
          Some: (userByHandle) => Result.Ok(userByHandle.id),
          None: () =>
            Result.Err(new Error("User with this handle was not found")),
        }),
      Err: (error) => Result.Err(error),
    });
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function getUserByPhone(
  phone: string,
): Promise<Result<InferSchema<UserById>, Error>> {
  try {
    const userByPhoneResult = await findUserIdByPhone(phone);

    return userByPhoneResult.match({
      Ok: (userByPhoneOption) =>
        userByPhoneOption.match({
          Some: async (userByPhone) => {
            const userResult = await findUserById(userByPhone.id);

            return userResult.match({
              Ok: (userOption) =>
                userOption.match({
                  Some: (user) => Result.Ok(user),
                  None: () =>
                    Result.Err(
                      new Error(
                        "Could not locate a user with the ID tied to the handle",
                      ),
                    ),
                }),
              Err: (error) => Result.Err(error),
            });
          },
          None: async () =>
            Result.Err(new Error("User with this handle was not found")),
        }),
      Err: async (error) => Result.Err(error),
    });
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function getUserIdByPhone(
  phone: string,
): Promise<Result<string, Error>> {
  try {
    const userByPhoneResult = await findUserIdByPhone(phone);

    return userByPhoneResult.match({
      Ok: (userByPhoneOption) =>
        userByPhoneOption.match({
          Some: (userByPhone) => Result.Ok(userByPhone.id),
          None: () =>
            Result.Err(new Error("User with this handle was not found")),
        }),
      Err: (error) => Result.Err(error),
    });
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function getUserByEmail(
  email: string,
): Promise<Result<InferSchema<UserById>, Error>> {
  try {
    const userByEmailResult = await findUserIdByEmail(email);

    return userByEmailResult.match({
      Ok: (userByEmailOption) =>
        userByEmailOption.match({
          Some: async (userByEmail) => {
            const userResult = await findUserById(userByEmail.id);

            return userResult.match({
              Ok: (userOption) =>
                userOption.match({
                  Some: (user) => Result.Ok(user),
                  None: () =>
                    Result.Err(
                      new Error(
                        "Could not locate a user with the ID tied to the handle",
                      ),
                    ),
                }),
              Err: (error) => Result.Err(error),
            });
          },
          None: async () =>
            Result.Err(new Error("User with this handle was not found")),
        }),
      Err: async (error) => Result.Err(error),
    });
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function getUserIdByEmail(
  email: string,
): Promise<Result<string, Error>> {
  try {
    const userByEmailResult = await findUserIdByEmail(email);

    return userByEmailResult.match({
      Ok: (userByEmailOption) =>
        userByEmailOption.match({
          Some: (user) => Result.Ok(user.id),
          None: () =>
            Result.Err(new Error("User with this handle was not found")),
        }),
      Err: (error) => Result.Err(error),
    });
  } catch (err) {
    return Result.Err(err as Error);
  }
}
