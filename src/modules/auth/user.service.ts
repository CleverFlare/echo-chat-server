import { Result } from "@/utils/rust-types";
import { userById } from "./schema";
import { InferSchema } from "@/cql/types";
import {
  findUserById,
  findUserIdByEmail,
  findUserIdByHandle,
  findUserIdByPhone,
} from "./repository";
import { AppError } from "@/utils/errors";

type UserById = typeof userById;

export async function getUserById(
  userId: string,
): Promise<Result<InferSchema<UserById>, AppError>> {
  return (await findUserById(userId)).match({
    Ok: (option) =>
      option.match({
        Some: (user) => Result.Ok(user),
        None: () =>
          Result.Err(
            AppError.client(`User with ID of ${userId} was not found`),
          ),
      }),
    Err: (error) => {
      throw error;
    },
  });
}

export async function getUserByHandle(
  handle: string,
): Promise<Result<InferSchema<UserById>, AppError>> {
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
                    AppError.client(
                      "Could not locate a user with the ID tied to the handle",
                    ) as AppError,
                  ),
              }),
            Err: (error) => Result.Err(error),
          });
        },
        None: async () =>
          Result.Err(AppError.client("User with this handle was not found")),
      }),
    Err: async (error) => Result.Err(error),
  });
}

export async function getUserIdByHandle(
  handle: string,
): Promise<Result<string, AppError>> {
  const userByHandleResult = await findUserIdByHandle(handle);

  return userByHandleResult.match({
    Ok: (userByHandleOption) =>
      userByHandleOption.match({
        Some: (userByHandle) => Result.Ok(userByHandle.id),
        None: () =>
          Result.Err(AppError.client("User with this handle was not found")),
      }),
    Err: (error) => Result.Err(error),
  });
}

export async function getUserByPhone(
  phone: string,
): Promise<Result<InferSchema<UserById>, AppError>> {
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
                    AppError.client(
                      "Could not locate a user with the ID tied to the handle",
                    ) as AppError,
                  ),
              }),
            Err: (error) => Result.Err(error),
          });
        },
        None: async () =>
          Result.Err(AppError.client("User with this handle was not found")),
      }),
    Err: async (error) => Result.Err(error),
  });
}

export async function getUserIdByPhone(
  phone: string,
): Promise<Result<string, AppError>> {
  const userByPhoneResult = await findUserIdByPhone(phone);

  return userByPhoneResult.match({
    Ok: (userByPhoneOption) =>
      userByPhoneOption.match({
        Some: (userByPhone) => Result.Ok(userByPhone.id),
        None: () =>
          Result.Err(AppError.client("User with this handle was not found")),
      }),
    Err: (error) => Result.Err(error),
  });
}

export async function getUserByEmail(
  email: string,
): Promise<Result<InferSchema<UserById>, AppError>> {
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
                    AppError.client(
                      "Could not locate a user with the ID tied to the handle",
                    ) as AppError,
                  ),
              }),
            Err: (error) => Result.Err(error),
          });
        },
        None: async () =>
          Result.Err(AppError.client("User with this handle was not found")),
      }),
    Err: async (error) => Result.Err(error),
  });
}

export async function getUserIdByEmail(
  email: string,
): Promise<Result<string, AppError>> {
  const userByEmailResult = await findUserIdByEmail(email);

  return userByEmailResult.match({
    Ok: (userByEmailOption) =>
      userByEmailOption.match({
        Some: (user) => Result.Ok(user.id),
        None: () =>
          Result.Err(AppError.client("User with this handle was not found")),
      }),
    Err: (error) => Result.Err(error),
  });
}
