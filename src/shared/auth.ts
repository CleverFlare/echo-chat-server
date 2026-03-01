import { cols, log, pad } from "@monitext/nprint";
import { betterAuth } from "better-auth";
import { phoneNumber } from "better-auth/plugins";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({ connectionString: Bun.env.AUTH_POSTGRES_URL }),
  plugins: [
    phoneNumber({
      sendOTP: ({ phoneNumber, code }) => {
        log(
          pad(
            [
              cols.blueBright(new Date().toLocaleString()),
              cols.dim(`OTP (${phoneNumber})):`),
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
});
