import { randomInt } from "crypto";

export function generateSecureOTP(): string {
  return randomInt(0, 9999).toString().padStart(4, "0");
}
