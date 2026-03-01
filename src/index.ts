import { Elysia } from "elysia";
import { cols, log, pad } from "@monitext/nprint";
import { auth } from "./shared/auth";

// user middleware (compute user and session and pass to routes)
const betterAuth = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) return status(401);

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });

const app = new Elysia()
  .mount(betterAuth)
  .get("/", () => "Hello Elysia")
  .listen(3000);

log(
  pad(
    cols.cyan(
      `🦊 Elysia is running at ${cols.underline(cols.blue(`${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}`))}`,
    ),
    { x: 2 },
  ),
);

log(pad(cols.cyan(`\nPress ${cols.gray("q")} to exit`), { x: 2 }));

// Configure terminal input
const stdin = process.stdin;
stdin.setRawMode(true); // Allows detecting individual keypresses
stdin.resume();
stdin.setEncoding("utf8");

stdin.on("data", (key) => {
  // 'q' key or Ctrl+C (ASCII 3)
  if (key === "q" || key === "\u0003") {
    log(pad(cols.gray("\nStopping server..."), { x: 2 }));
    app.stop().then(() => {
      log(pad(cols.gray("\nServer stopped."), { x: 2 }));
      process.exit(0);
    });
  }
});
