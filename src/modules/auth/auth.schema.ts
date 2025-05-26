export const loginUser = `create table user_by_username (
  username TEXT PRIMARY KEY,
  password_hash TEXT,
  id TEXT
)`;

export const registerUser = `create table user_by_id (
  id TEXT PRIMARY KEY,
  username TEXT,
  password_hash TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  avatar_url TEXT
)`;

export const connectedByUserId = `
CREATE TABLE connected_by_user_id (
  user_id text PRIMARY KEY,
  socket_id text,
)
`;

export const connectedBySocketId = `
CREATE TABLE connected_by_socket_id (
  socket_id text PRIMARY KEY,
  user_id text,
)
`;
