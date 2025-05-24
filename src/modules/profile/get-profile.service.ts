import { env } from "@/env";
import { jwtVerify } from "jose";
import { getUserById } from "./profile.repository";
import { AppError } from "@/shared/app-error";
import { StatusCodes } from "http-status-codes";
import { sanitizeObject } from "@/shared/utils";

export async function getProfile(token: string) {
  const {
    payload: {
      data: { id },
    },
  } = await jwtVerify<{ data: { id: string } }>(
    token,
    new TextEncoder().encode(env.JWT_PRIVATE),
  );

  const user = await getUserById<{
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    password_hash: string;
    avatar_url?: string;
  }>(id);

  if (!user) {
    throw new AppError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      "Invalid user ID stored in the JWT",
    );
  }

  const profile = sanitizeObject(user, "password_hash");

  return {
    firstName: profile.first_name,
    lastName: profile.last_name,
    username: profile.username,
    id: profile.id,
    avatarUrl: profile.avatar_url,
  };
}
