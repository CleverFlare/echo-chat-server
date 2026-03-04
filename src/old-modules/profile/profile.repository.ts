import { client } from "@/utils/database";

export async function getUserById<T>(userId: string) {
  const userRecord = await client.execute(
    "SELECT * FROM user_by_id WHERE id=?",
    [userId],
    { prepare: true },
  );

  if (userRecord.rows.length <= 0) return null;

  return userRecord.rows[0] as T;
}
