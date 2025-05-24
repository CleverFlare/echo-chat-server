import { client } from "@/shared/database";

export async function getUserById<T>(userId: string) {
  const userRecord = await client.execute(
    "SELECT * FROM user_by_id WHERE id=?",
    [userId],
    { prepare: true },
  );

  if (userRecord.rows.length <= 0) return null;

  console.log("USER", userRecord.rows[0]);

  return userRecord.rows[0] as T;
}
