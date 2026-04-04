import { cols, log, pad } from "@monitext/nprint";
import { betterAuth } from "better-auth";
import { admin, emailOTP, phoneNumber } from "better-auth/plugins";
import { Pool } from "pg";
import { openAPI } from "better-auth/plugins";
import Elysia from "elysia";
import {
  findUserIdByEmail,
  findUserIdByPhone,
  insertUser,
  removeUser,
  updateUser,
} from "@/modules/auth/repository";
import { generateOpenPeepsAvatar } from "./random-avatar";

function getReason(
  type: "sign-in" | "change-email" | "email-verification" | "forget-password",
) {
  switch (type) {
    case "sign-in":
      return "sign in";
    case "change-email":
      return "change email";
    case "email-verification":
      return "email verification";
    case "forget-password":
      return "forget password";
  }
}

const auth = betterAuth({
  database: new Pool({ connectionString: process.env.AUTH_POSTGRES_URL }),

  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      firstName: { type: "string", fieldName: "firstName", required: true },
      lastName: { type: "string", fieldName: "lastName", required: true },
      handle: {
        type: "string",
        fieldName: "handle",
        required: true,
      },
      avatar: {
        type: "string",
        fieldName: "avatar",
        required: false,
        defaultValue: () => generateOpenPeepsAvatar(),
      },
      bio: {
        type: "string",
        fieldName: "bio",
        required: false,
        defaultValue: "Hey, there! I'm using Echo.",
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await insertUser({
            id: user.id,
            firstName: user.firstName as string,
            lastName: user.lastName as string,
            createdAt: user.createdAt,
            email: user.email,
            avatar: user.avatar as string,
            bio: user.bio as string,
            handle: user.handle as string,
            phone: user.name,
          });
        },
      },
      delete: {
        after: async (user) => {
          await removeUser(user.id);
        },
      },
      update: {
        after: async (user) => {
          await updateUser(user.id, {
            phone: user.name,
            email: user.email,
            avatar: user.avatar as string | undefined,
            bio: user.bio as string | undefined,
            firstName: user.firstName as string | undefined,
            lastName: user.lastName as string | undefined,
            handle: user.handle as string | undefined,
          });
        },
      },
    },
  },
  plugins: [
    admin(),
    openAPI(),
    emailOTP({
      sendVerificationOnSignUp: true,
      sendVerificationOTP: async ({ email, otp, type }) => {
        const reason = getReason(type);
        log(
          pad(
            [
              cols.blueBright(new Date().toLocaleString()),
              cols.dim(`OTP for "${reason}" (${email}):`),
              otp,
            ].join(" "),
            {
              x: 2,
            },
          ),
        );
      },
    }),
    phoneNumber({
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => phoneNumber,
        getTempName: (phoneNumber) => phoneNumber,
      },
      sendOTP: async ({ phoneNumber, code }) => {
        log(
          pad(
            [
              cols.blueBright(new Date().toLocaleString()),
              cols.dim(`OTP (${phoneNumber}):`),
              code,
            ].join(" "),
            {
              x: 2,
            },
          ),
        );
      },
    }),
  ],
  trustedOrigins: [process.env.CLIENT_ORIGIN],
});

// 1. Logic & Mount
export const authHandler = new Elysia({ name: "auth-handler" }).group(
  "/api/auth",
  (group) =>
    group
      .onBeforeHandle(async ({ request: req, status, body }) => {
        const url = new URL(req.url);

        // We use 'body' here. Elysia has already parsed it.
        // The trick is making sure the final handler gets a fresh version.

        if (url.pathname.endsWith("/phone-number/send-otp")) {
          const existOnly = req.headers.get("x-exist-only");
          if (existOnly === "true") {
            const data = body as any;
            const userResult = await findUserIdByPhone(data.phoneNumber);

            if (userResult.isErr() || userResult.unwrap().isNone()) {
              return status(400, {
                message: "Phone number is not registered.",
              });
            }
          }
        }

        if (url.pathname.endsWith("/email-otp/send-verification-otp")) {
          const data = body as any;
          if (data?.type !== "sign-in") return;

          const userResult = await findUserIdByEmail(data.email);
          if (userResult.isErr() || userResult.unwrap().isNone()) {
            return status(400, { message: "Email is not registered." });
          }
        }
      })
      /**
       * FIX: Use a fresh request for Better Auth.
       * Better-Auth's handler needs to read the body stream.
       * Since Elysia already read it to give us the 'body' object above,
       * we pass the data back into a new Request if it's a POST/PUT.
       */
      .all("/*", async ({ request, body }) => {
        if (request.method !== "GET" && request.method !== "HEAD" && body) {
          // Reconstruct the request so the body stream is "fresh" for Better-Auth
          return auth.handler(
            new Request(request.url, {
              method: request.method,
              headers: request.headers,
              body: JSON.stringify(body),
            }),
          );
        }
        return auth.handler(request);
      }),
);

// 2. Macro (Used for route protection)
export const authMacro = new Elysia({ name: "auth-macro" }).macro({
  auth: {
    async resolve({ status, request }) {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) return status(401, "Unauthorized");
      return { user: session.user, session: session.session };
    },
  },
});

export default auth;
