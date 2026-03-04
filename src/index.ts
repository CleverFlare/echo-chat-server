import { Elysia } from "elysia";
import { cols } from "@monitext/nprint";
import { authMiddleware } from "./utils/auth";
import { db } from "./utils/database";
import logger from "./utils/logger";

async function main() {
  await db.connect();

  const app = new Elysia()
    .use(authMiddleware)
    .get("/", "Hello, World!")
    .listen(3000);

  logger.log(
    cols.cyan(
      `🦊 Elysia is running at ${cols.underline(cols.blue(`${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}`))}`,
    ),
  )({ hideDateTime: true });

  logger.log(cols.cyan(`\nPress ${cols.gray("q")} to exit`))({
    hideDateTime: true,
  });

  // Configure terminal input
  const stdin = process.stdin;
  stdin.setRawMode(true); // Allows detecting individual keypresses
  stdin.resume();
  stdin.setEncoding("utf8");

  stdin.on("data", (key) => {
    // 'q' key or Ctrl+C (ASCII 3)
    if (key === "q" || key === "\u0003") {
      logger.log(cols.gray("\nStopping server..."))({ hideDateTime: true });
      app.stop().then(() => {
        logger.log(cols.gray("\nServer stopped."))({ hideDateTime: true });
        process.exit(0);
      });
    }
  });
}

main();
