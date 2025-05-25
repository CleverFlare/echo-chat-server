export type Message = {
  chat_id: string;
  timestamp: string;
  id: string;
  content: string;
  sender_id: string;
  status: string;
  is_edited: boolean;
};

export const messageByChatId = `
CREATE TABLE message_by_chat_id (
  chat_id text,
  timestamp timestamp,
  id text,
  content text,
  sender_id text,
  status text,
  is_edited boolean,
  PRIMARY KEY ((chat_id), timestamp)
)
`;

export const connectedUserId = `
CREATE TABLE connected_user_id (
  user_id text PRIMARY KEY,
  socket_id text,
)
`;
