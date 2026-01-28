export const lastMessage = `
CREATE TYPE last_message (
  id text,
  content text,
  timestamp timestamp,
  sender_id text,
  status text
)`;

export const userContacts = `
CREATE TABLE user_contacts (
  user_id text,
  contact_id text,
  first_name text,
  last_name text,
  username text,
  avatar_url text,
  chat_id text,
  unread int,
  last_message frozen<last_message>,
  PRIMARY KEY (user_id, contact_id)
)`;
