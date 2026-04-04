import Elysia from "elysia";
import { chatsController } from "./chats/controller";
import { friendsController } from "./friends/controller";
import { peopleController } from "./people/controller";
import { authMacro } from "@/utils/auth";

export const contactsRouter = new Elysia()
  .use(authMacro)
  .use(chatsController)
  .use(friendsController)
  .use(peopleController);
