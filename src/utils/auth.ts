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

// user middleware (compute user and session and pass to routes)
export const authMiddleware = new Elysia({ name: "better-auth" })
  .onBeforeHandle({ as: "global" }, async ({ request: req, status }) => {
    const url = new URL(req.url);

    if (url.pathname === "/api/auth/phone-number/send-otp") {
      const existOnly = req.headers.get("x-exist-only");

      if (existOnly === "true") {
        const body = await req.clone().json(); // clone before reading
        const userResult = await findUserIdByPhone(body.phoneNumber);

        console.log("USER", userResult.unwrap().unwrap());

        if (userResult.isErr() || userResult.unwrap().isNone()) {
          return status(400, { message: "Phone number is not registered." });
        }
      }
    }

    if (url.pathname === "/api/auth/email-otp/send-verification-otp") {
      const body = await req.clone().json();

      if (body.type !== "sign-in") return;

      const userResult = await findUserIdByEmail(body.email);

      if (userResult.isErr() || userResult.unwrap().isNone()) {
        return status(400, { message: "Email is not registered." });
      }
    }
  })
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

export default auth;
