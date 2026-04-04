import { authMacro } from "@/utils/auth";
import Elysia from "elysia";
import { getChatsByUserId } from "./chats.service";
import logger from "@/utils/logger";

export const chatsController = new Elysia().use(authMacro).get(
  "/chats",
  async ({ user, status }) => {
    const chats = await getChatsByUserId(user.id);

    if (chats.isErr()) {
      const error = chats.unwrapErr();

      switch (error.kind) {
        case "server":
          logger.error(error.message);
          return status("Internal Server Error", "Internal Server Error");
        case "client":
          return status("Bad Request", error.message);
      }
    }

    return status("OK", chats.unwrap());
  },
  { auth: true },
); // list all DM conversations
