import { authMacro } from "@/utils/auth";
import Elysia from "elysia";

export const peopleController = new Elysia()
  .use(authMacro)
  .get("/people", () => {}, { auth: true }) // list all people
  .delete("/people/:userId", () => {}, { auth: true }); // list all people
