import { client } from "@/utils/database";

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
  const currentTime = new Date().toISOString();

  const userByIdParams = [
    uuid,
    firstName,
    lastName,
    email,
    username,
    password,
    currentTime,
    "Hey, there! I'm using Echo Chat.",
  ];

  await client.execute(
    "INSERT INTO user_by_id (id, first_name, last_name, email, username, password_hash, created_at, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    userByIdParams,
    { prepare: true },
  );

  const userByUsernameParams = [username, password, uuid, currentTime];

  await client.execute(
    "INSERT INTO user_by_username (username, password_hash, id, created_at) VALUES (?, ?, ?, ?)",
    userByUsernameParams,
    { prepare: true },
  );

  return { firstName, lastName, email, username, id: uuid };
}

export async function findUserByUserId<T>(userId: string) {
  const userByIdRecord = await client.execute(
    "SELECT * FROM user_by_id WHERE id=?",
    [userId],
    { prepare: true },
  );

  return userByIdRecord.rows[0] as T;
}

export async function insertConnectedUser({
  userId,
  socketId,
}: {
  userId: string;
  socketId: string;
}) {
  await client.execute(
    "INSERT INTO connected_by_user_id (user_id, socket_id) VALUES (?, ?)",
    [userId, socketId],
    {
      prepare: true,
    },
  );

  await client.execute(
    "INSERT INTO connected_by_socket_id (socket_id, user_id) VALUES (?, ?)",
    [socketId, userId],
    {
      prepare: true,
    },
  );
}

export async function findConnectedUserByUserId<T>(userId: string) {
  const result = await client.execute(
    "SELECT * FROM connected_by_user_id WHERE user_id=?",
    [userId],
    { prepare: true },
  );

  return result.rows[0] as T;
}

export async function findConnectedUserBySocketId<T>(socketId: string) {
  const result = await client.execute(
    "SELECT * FROM connected_by_socket_id WHERE socket_id=?",
    [socketId],
    { prepare: true },
  );

  return result.rows[0] as T;
}

export async function deleteConnectedUserBySocketId(socketId: string) {
  const result = await client.execute(
    "SELECT * FROM connected_by_socket_id WHERE socket_id=?",
    [socketId],
    { prepare: true },
  );

  if (!result?.rows?.[0]) return;

  const connectedUser = result.rows[0] as unknown as {
    user_id: string;
    socket_id: string;
  };

  await client.execute(
    "DELETE FROM connected_by_user_id WHERE user_id=?",
    [connectedUser.user_id],
    { prepare: true },
  );

  await client.execute(
    "DELETE FROM connected_by_socket_id WHERE socket_id=?",
    [connectedUser.socket_id],
    { prepare: true },
  );
}
