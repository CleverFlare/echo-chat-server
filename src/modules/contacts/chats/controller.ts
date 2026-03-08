import { authMiddleware } from "@/utils/auth";
import Elysia from "elysia";
import { getChatsByUserId } from "./chats.service";
import logger from "@/utils/logger";

export const chatsController = new Elysia()
  .use(authMiddleware)
  .get(
    "/chats",
    async ({ user, status }) => {
      const chats = await getChatsByUserId(user.id);

      if (chats.isErr()) {
        logger.error(chats.unwrapErr().message);

        return status(
          "Internal Server Error",
          "Please check the server logs for details",
        );
      }

      return status("OK", chats.unwrap());
    },
    { auth: true },
  ) // list all DM conversations
  .get("/chats/:chatId", () => {}, { auth: true }) // get a conversation + messages
  .delete("/chats/:chatId", () => {}, { auth: true }); // delete own copy of chat history
