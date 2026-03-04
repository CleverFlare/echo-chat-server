import auth from "@/utils/auth";
import { Elysia } from "elysia";

export const authContext = new Elysia().derive(
  { as: "global" },
  async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return {
      user: session?.user ?? null,
      session: session?.session ?? null,
    };
  },
);
