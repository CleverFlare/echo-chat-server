import { Result } from "@/utils/rust-types";
import { findFriend, removeFriend } from "./repository";
import { addPerson } from "../people/add-person.service";

export async function unfriend(
  userId: string,
  friendId: string,
): Promise<Result<void, Error>> {
  const result = await findFriend(userId, friendId);

  if (result.isErr()) {
    return Result.Err(result.unwrapErr());
  }

  const option = result.unwrap();

  if (option.isNone()) {
    return Result.Err(new Error(`No friend was found with ID of ${friendId}`));
  }

  const friend = option.unwrap();

  await removeFriend(userId, friendId);

  await addPerson({
    avatar: friend.avatar,
    contactId: friend.friendId,
    createdAt: friend.createdAt,
    firstName: friend.firstName,
    lastName: friend.lastName,
    ownerId: friend.userId,
  });

  return Result.Ok(undefined);
}
