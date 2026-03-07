import { cql } from "@/cql/cql-types";
import { db } from "@/utils/database";

export const peopleBuilder = db
  .create()
  .table("people")
  .schema({
    owner_id: cql.scalar.text,
    contact_id: cql.scalar.text,
    created_at: cql.scalar.timestamp,
  })
  .primaryKey("owner_id", "contact_id");

export const people = peopleBuilder.build();

export const friendsBuilder = db
  .create()
  .table("friends")
  .schema({
    user_id: cql.scalar.text,
    friend_id: cql.scalar.text,
    created_at: cql.scalar.timestamp,
  })
  .primaryKey("user_id", "friend_id");

export const friends = friendsBuilder.build();

export const chatsBuilder = db
  .create()
  .table("chats")
  .schema({
    user_id: cql.scalar.text,
    other_user_id: cql.scalar.text,
    chat_id: cql.scalar.text,
    last_message: cql.scalar.text,
    last_message_at: cql.scalar.timestamp,
    is_friend: cql.scalar.boolean,
  })
  .primaryKey("user_id", "last_message_at", "chat_id");

export const chats = chatsBuilder.build();

export const friendRequestsBuilder = db
  .create()
  .table("friends_requests")
  .schema({
    receiver_id: cql.scalar.text,
    sender_id: cql.scalar.text,
    created_at: cql.scalar.timestamp,
    status: cql.scalar.text,
  })
  .primaryKey("receiver_id", "sender_id");

export const friendRequests = friendRequestsBuilder.build();

export const friendRequestsBySenderIdBuilder = db
  .create()
  .table("friend_requests_by_sender_id")
  .schema({
    receiver_id: cql.scalar.text,
    sender_id: cql.scalar.text,
    created_at: cql.scalar.timestamp,
    status: cql.scalar.text,
  })
  .primaryKey("sender_id", "receiver_id");

export const friendRequestsBySenderId = friendRequestsBySenderIdBuilder.build();

export const blocksBuilder = db
  .create()
  .table("blocks")
  .schema({
    blocker_id: cql.scalar.text,
    blocked_id: cql.scalar.text,
    created_at: cql.scalar.timestamp,
  })
  .primaryKey("blocker_id", "blocked_id");

export const blocks = blocksBuilder.build();
