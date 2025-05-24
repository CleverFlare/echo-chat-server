import { env } from "@/env";
import { jwtVerify } from "jose";

export async function extractTokenData(token: string) {
  const {
    payload: { data },
  } = await jwtVerify<{ data: { id: string; username: string } }>(
    token,
    new TextEncoder().encode(env.JWT_PRIVATE),
  );

  return data;
}
