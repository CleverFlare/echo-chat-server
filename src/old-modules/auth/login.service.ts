import { AppError } from "@/shared/app-error";
import { getUserByUsername } from "./auth.repository";
import { StatusCodes } from "http-status-codes";
import { compare } from "bcrypt";
import { SignJWT } from "jose";
import { env } from "@/env";

type LoginType = {
  username: string;
  password: string;
};

export async function login({ username, password }: LoginType) {
  const user = await getUserByUsername<{
    id: string;
    username: string;
    password_hash: string;
  }>(username);

  if (!user) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Incorrect username or password",
    );
  }

  const isPasswordCorrect = await compare(password, user.password_hash);

  if (!isPasswordCorrect) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Incorrect username or password",
    );
  }

  // iat = Issued At
  // 1000 converts the `now()` milliseconds to seconds
  const iat = Math.floor(Date.now() / 1000);

  // Create the JWT
  const token = await new SignJWT({
    data: {
      id: user.id as string,
      username: user.username as string,
    },
  })
    .setExpirationTime("7d")
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(env.JWT_PRIVATE));

  return token;
}
