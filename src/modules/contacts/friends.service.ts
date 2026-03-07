import { Result } from "@/utils/rust-types";
import {
  getUserIdByEmail,
  getUserIdByHandle,
  getUserIdByPhone,
  getUserById,
} from "../auth/user.service";
import {
  findBlock,
  findFriendRequest,
  insertBlock,
  insertFriendRequest,
} from "./repository";
import { InferSchema } from "@/cql/types";
import { friendRequests } from "./schema";
import { CamelCasedProperties } from "type-fest";
import { toCamelCaseProperties } from "@/utils/naming-utilities";

export async function sendFriendRequestByPhone(
  userId: string,
  phone: string,
): Promise<
  Result<CamelCasedProperties<InferSchema<typeof friendRequests>>, Error>
> {
  const userResult = await getUserIdByPhone(phone);

  return userResult.match({
    Ok: async (id) => {
      await insertFriendRequest(userId, id);
      return (await findFriendRequest(userId, id)).match({
        Ok: (friendRequest) => Result.Ok(toCamelCaseProperties(friendRequest)),
        Err: (error) => Result.Err(error),
      });
    },
    Err: async (error) => Result.Err(error),
  });
}

export async function sendFriendRequestByHandle(
  userId: string,
  handle: string,
): Promise<
  Result<CamelCasedProperties<InferSchema<typeof friendRequests>>, Error>
> {
  const userResult = await getUserIdByHandle(handle);

  return userResult.match({
    Ok: async (id) => {
      await insertFriendRequest(userId, id);
      return (await findFriendRequest(userId, id)).match({
        Ok: (friendRequest) => Result.Ok(toCamelCaseProperties(friendRequest)),
        Err: (error) => Result.Err(error),
      });
    },
    Err: async (error) => Result.Err(error),
  });
}

export async function sendFriendRequestByEmail(
  userId: string,
  email: string,
): Promise<
  Result<CamelCasedProperties<InferSchema<typeof friendRequests>>, Error>
> {
  const userResult = await getUserIdByEmail(email);

  return userResult.match({
    Ok: async (id) => {
      await insertFriendRequest(userId, id);
      return (await findFriendRequest(userId, id)).match({
        Ok: (friendRequest) => Result.Ok(toCamelCaseProperties(friendRequest)),
        Err: (error) => Result.Err(error),
      });
    },
    Err: async (error) => Result.Err(error),
  });
}

export async function sendFriendRequestById(
  userId: string,
  personId: string,
): Promise<
  Result<CamelCasedProperties<InferSchema<typeof friendRequests>>, Error>
> {
  const personResult = await getUserById(personId);

  return personResult.match({
    Ok: async (person) => {
      await insertFriendRequest(userId, person.id);
      return (await findFriendRequest(userId, person.id)).match({
        Ok: (friendRequest) => Result.Ok(toCamelCaseProperties(friendRequest)),
        Err: (error) => Result.Err(error),
      });
    },
    Err: async (error) => Result.Err(error),
  });
}

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
