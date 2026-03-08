import { authMiddleware } from "@/utils/auth";
import Elysia from "elysia";
import { blockPerson } from "./block.service";
import logger from "@/utils/logger";

export const chatsController = new Elysia()
  .use(authMiddleware)
  .get("/blocks", () => {}, { auth: true }) // list app-level blocks
  .post(
    "/blocks/:userId",
    async ({ params: { userId }, user, status }) => {
      const blockResult = await blockPerson(user.id, userId);

      if (blockResult.isErr()) {
        logger.error(blockResult.unwrapErr().message);

        return status(
          "Internal Server Error",
          "Please check the server logs for details",
        );
      }

      return status("OK", { userId });
    },
    { auth: true },
  ) // app-level block
  .delete("/blocks/:userId", () => {}, { auth: true }); // app-level unblock
