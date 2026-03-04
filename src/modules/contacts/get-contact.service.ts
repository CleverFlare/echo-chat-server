import { InferSchema } from "@/cql/types";
import { Result } from "@/utils/rust-types";
import { contactByUserId } from "./schema";
import { findContactsByHandle } from "./repository";

// eslint-disable-next-line
const contactsByUserIdContext = contactByUserId.build();

export async function getContact(
  handle: string,
): Promise<Result<InferSchema<typeof contactsByUserIdContext>, Error>> {
  const contactsResult = await findContactsByHandle(handle);

  return contactsResult.match({
    Ok: (contacts) => Result.Ok(contacts[0]),
    Err: (error) => Result.Err(error),
  });
}
