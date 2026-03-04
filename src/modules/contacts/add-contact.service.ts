import { Result } from "@/utils/rust-types";
import { findContactsByHandle, insertContact } from "./repository";

export async function addContact(
  userId: string,
  handle: string,
): Promise<Result<void, Error>> {
  const contactResult = await findContactsByHandle(handle);

  return contactResult.match({
    Ok: (contact) => insertContact(userId, contact[0].handle),
    Err: (error) => Promise.resolve(Result.Err(error)),
  });
}
