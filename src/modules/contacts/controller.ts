import { authMiddleware } from "@/utils/auth";
import Elysia from "elysia";
import { chatsController } from "./chats/controller";
import { friendsController } from "./friends/controller";
import { peopleController } from "./people/controller";

export const contactsRouter = new Elysia()
  .use(authMiddleware)
  .use(chatsController)
  .use(friendsController)
  .use(peopleController);
