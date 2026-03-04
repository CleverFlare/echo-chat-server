import { getUserByUsername, insertUser } from "./auth.repository";
import { SignJWT } from "jose";
import { hash } from "bcrypt";
import { env } from "@/env";
import { AppError } from "@/utils/app-error";
import { StatusCodes } from "http-status-codes";

type RegisterType = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
};

export async function register({
  firstName,
  lastName,
  email,
  username,
  password,
}: RegisterType) {
  const passwordHash = await hash(password, +env.HASH_SALT);

  const userByUsername = await getUserByUsername(username);

  if (userByUsername) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "This username is already in use",
    );
  }

  const data = await insertUser({
    firstName,
    lastName,
    email,
    username,
    password: passwordHash,
  });

  // iat = Issued At
  // 1000 converts the `now()` milliseconds to seconds
  const iat = Math.floor(Date.now() / 1000);

  // Create the JWT
  const token = await new SignJWT({
    data: {
      id: data.id as string,
      username: data.username as string,
    },
  })
    .setExpirationTime("7d")
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(env.JWT_PRIVATE));

  return token;
}
