import { InferSchema } from "@/cql/types";
import { Result } from "@/utils/rust-types";
import { people } from "./schema";
import { findPeopleByUserId } from "./repository";
import { getUserByHandle } from "../auth/user.service";
import { CamelCasedProperties } from "type-fest";
import { toCamelCaseProperties } from "@/utils/naming-utilities";

export async function getPersonByHandle(
  handle: string,
): Promise<Result<CamelCasedProperties<InferSchema<typeof people>>, Error>> {
  const contactsResult = await getUserByHandle(handle);

  return contactsResult.match({
    Ok: async (user) => {
      const personResult = await findPeopleByUserId(user.id);

      return personResult.match({
        Ok: (personOption) => Result.Ok(toCamelCaseProperties(personOption[0])),
        Err: (error) => Result.Err(error),
      });
    },
    Err: async (error) => Result.Err(error),
  });
}

export async function getPeopleByUserId(
  userId: string,
): Promise<Result<CamelCasedProperties<InferSchema<typeof people>>[], Error>> {
  const peopleResult = await findPeopleByUserId(userId);

  return peopleResult.match({
    Ok: (people) =>
      Result.Ok(people.map((person) => toCamelCaseProperties(person))),
    Err: (error) => Result.Err(error),
  });
}
