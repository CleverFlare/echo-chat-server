import { InferSchema } from "@/cql/types";
import { Result } from "@/utils/rust-types";
import { contactByUserId } from "./schema";
import { findContactsByUserId } from "./repository";

// eslint-disable-next-line
const contactsByUserIdContext = contactByUserId.build();

export async function getContacts(
  userId: string,
): Promise<Result<InferSchema<typeof contactsByUserIdContext>[], Error>> {
  const contactsResult = await findContactsByUserId(userId);

  return contactsResult.match({
    Ok: (contacts) => Result.Ok(contacts),
    Err: (error) => Result.Err(error),
  });
}
