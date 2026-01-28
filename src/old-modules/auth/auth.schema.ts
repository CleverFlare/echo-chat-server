export const loginUser = `create table user_by_username (
  username TEXT PRIMARY KEY,
  password_hash TEXT,
  id TEXT,
  created_at timestamp
)`;

export const registerUser = `create table user_by_id (
  id TEXT PRIMARY KEY,
  username TEXT,
  password_hash TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at timestamp,
  bio text
)`;

export const connectedByUserId = `
CREATE TABLE connected_by_user_id (
  user_id TEXT PRIMARY KEY,
  socket_id TEXT,
)
`;

export const connectedBySocketId = `
CREATE TABLE connected_by_socket_id (
  socket_id TEXT PRIMARY KEY,
  user_id TEXT,
)
`;
