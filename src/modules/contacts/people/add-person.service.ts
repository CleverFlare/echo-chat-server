import { InferSchema } from "@/cql/types";
import { people } from "../schema";
import { insertPerson } from "./repository";

export async function addPerson(person: InferSchema<typeof people>) {
  return insertPerson(person);
}
