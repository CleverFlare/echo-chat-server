import { Result } from "@/utils/rust-types";
import { findUserById } from "@/modules/auth/repository";
import { contactByHandle, contactByUserId } from "./schema";
import logger from "@/utils/logger";
import { randomUUIDv7 } from "bun";
import { InferSchema } from "@/cql/types";

export async function findContactsByUserId(
  id: string,
): Promise<Result<InferSchema<typeof contactByUserId>[], Error>> {
  try {
    const users = await contactByUserId
      .select("*")
      .where("user_id", "=", id)
      .build()
      .execute();

    return Result.Ok(users);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function findContactsByHandle(
  handle: string,
): Promise<Result<InferSchema<typeof contactByUserId>[], Error>> {
  try {
    const users = await contactByHandle
      .select("*")
      .where("handle", "=", handle)
      .build()
      .execute();

    return Result.Ok(users);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

export async function insertContact(
  userId: string,
  contactId: string,
): Promise<Result<void, Error>> {
  try {
    const user = await findUserById(userId);

    user.match({
      Ok: (value) =>
        value.match({
          Some: async (value) => {
            await contactByUserId
              .insert({
                first_name: value.first_name,
                last_name: value.last_name,
                avatar: value.avatar,
                user_id: value.id,
                contact_id: contactId,
                chat_id: randomUUIDv7(),
                handle: value.handle,
              })
              .build()
              .execute();

            await contactByHandle
              .insert({
                first_name: value.first_name,
                last_name: value.last_name,
                avatar: value.avatar,
                user_id: value.id,
                contact_id: contactId,
                chat_id: randomUUIDv7(),
                handle: value.handle,
              })
              .build()
              .execute();
          },
          None: () => {},
        }),
      Err: (err) => {
        logger.error(err.message)();
      },
    });

    const contact = await findUserById(contactId);

    contact.match({
      Ok: (value) =>
        value.match({
          Some: async (value) => {
            await contactByUserId
              .insert({
                first_name: value.first_name,
                last_name: value.last_name,
                avatar: value.avatar,
                user_id: value.id,
                contact_id: userId,
                chat_id: randomUUIDv7(),
                handle: value.handle,
              })
              .build()
              .execute();

            await contactByHandle
              .insert({
                first_name: value.first_name,
                last_name: value.last_name,
                avatar: value.avatar,
                user_id: value.id,
                contact_id: userId,
                chat_id: randomUUIDv7(),
                handle: value.handle,
              })
              .build()
              .execute();
          },
          None: () => {},
        }),
      Err: (err) => {
        logger.error(err.message)();
      },
    });

    return Result.Ok(undefined);
  } catch (err) {
    return Result.Err(err as Error);
  }
}
