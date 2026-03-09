import { authMiddleware } from "@/utils/auth";
import Elysia from "elysia";
import { blockPerson } from "./block.service";
import logger from "@/utils/logger";
import { getBlocks } from "./get-blocks.service";

export const chatsController = new Elysia()
  .use(authMiddleware)
  .get(
    "/blocks",
    async ({ user, status }) => {
      const result = await getBlocks(user.id);

      if (result.isErr()) {
        const error = result.unwrapErr();

        switch (error.kind) {
          case "server":
            logger.error(error.message);
            return status("Internal Server Error", "Internal Server Error");
          case "client":
            return status("Bad Request", error.message);
        }
      }

      const blocks = result.unwrap();

      return status("OK", blocks);
    },
    { auth: true },
  ) // list app-level blocks
  .post(
    "/blocks/:userId",
    async ({ params: { userId }, user, status }) => {
      const blockResult = await blockPerson(user.id, userId);

      if (blockResult.isErr()) {
        const error = blockResult.unwrapErr();

        switch (error.kind) {
          case "server":
            logger.error(blockResult.unwrapErr().message);

            return status("Internal Server Error", "Internal Server Error");
          case "client":
            return status("Bad Request", error.message);
        }
      }

      return status("OK", { userId });
    },
    { auth: true },
  ) // app-level block
  .delete("/blocks/:userId", () => {}, { auth: true }); // app-level unblock
