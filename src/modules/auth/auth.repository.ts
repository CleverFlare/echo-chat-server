import { client } from "@/shared/database";

export async function getUserByUsername<T>(username: string) {
  const userByUsernameRecord = await client.execute(
    "SELECT * FROM user_by_username WHERE username=?",
    [username],
    { prepare: true },
  );

  if (userByUsernameRecord.rows.length <= 0) return null;

  const userId = userByUsernameRecord.rows[0].get("id");

  const userByIdRecord = await client.execute(
    "SELECT * FROM user_by_id WHERE id=?",
    [userId],
    { prepare: true },
  );

  return userByIdRecord.rows[0] as T;
}

type InsertUserType = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
};

export async function insertUser({
  firstName,
  lastName,
  email,
  username,
  password,
}: InsertUserType) {
  const uuid = crypto.randomUUID();

  const userByIdParams = [uuid, firstName, lastName, email, username, password];

  await client.execute(
    "INSERT INTO user_by_id (id, first_name, last_name, email, username, password_hash) VALUES (?, ?, ?, ?, ?, ?)",
    userByIdParams,
    { prepare: true },
  );

  const userByUsernameParams = [username, password, uuid];

  await client.execute(
    "INSERT INTO user_by_username (username, password_hash, id) VALUES (?, ?, ?)",
    userByUsernameParams,
    { prepare: true },
  );

  return { firstName, lastName, email, username, id: uuid };
}
