import { cql } from "@/cql/cql-types";
import { db } from "@/utils/database";

export const peopleBuilder = db
  .create()
  .table("people")
  .schema({
    avatar: cql.scalar.text,
    firstName: cql.scalar.text,
    lastName: cql.scalar.text,

    ownerId: cql.scalar.text,
    contactId: cql.scalar.text,
    createdAt: cql.scalar.timestamp,
  })
  .primaryKey("ownerId", "contactId");

export const people = peopleBuilder.build();

export const friendsBuilder = db
  .create()
  .table("friends")
  .schema({
    avatar: cql.scalar.text,
    firstName: cql.scalar.text,
    lastName: cql.scalar.text,

    userId: cql.scalar.text,
    friendId: cql.scalar.text,
    createdAt: cql.scalar.timestamp,
  })
  .primaryKey("userId", "friendId");

export const friends = friendsBuilder.build();

export const chatsBuilder = db.create().table("chats").schema({
  avatar: cql.scalar.text,
  firstName: cql.scalar.text,
  lastName: cql.scalar.text,

  userId: cql.scalar.text,
  otherUserId: cql.scalar.text,
  chatId: cql.scalar.text,
  lastMessage: cql.scalar.text,
  lastMessageAt: cql.scalar.timestamp,
  isFriend: cql.scalar.boolean,
});

export const chats = chatsBuilder
  .primaryKey("userId", "lastMessageAt", "chatId")
  .build();

export const chatsByChatId = chatsBuilder.primaryKey(
  "chatId",
  "lastMessageAt",
  "userId",
);

export const friendRequestsBuilder = db
  .create()
  .table("friendRequests")
  .schema({
    avatar: cql.scalar.text,
    firstName: cql.scalar.text,
    lastName: cql.scalar.text,

    receiverId: cql.scalar.text,
    senderId: cql.scalar.text,
    createdAt: cql.scalar.timestamp,
    status: cql.scalar.text,
  })
  .primaryKey("receiverId", "senderId");

export const friendRequests = friendRequestsBuilder.build();

export const friendRequestsBySenderIdBuilder = db
  .create()
  .table("friendRequestsBySenderId")
  .schema({
    avatar: cql.scalar.text,
    firstName: cql.scalar.text,
    lastName: cql.scalar.text,

    receiverId: cql.scalar.text,
    senderId: cql.scalar.text,
    createdAt: cql.scalar.timestamp,
    status: cql.scalar.text,
  })
  .primaryKey("senderId", "receiverId");

export const friendRequestsBySenderId = friendRequestsBySenderIdBuilder.build();

export const blocksBuilder = db
  .create()
  .table("blocks")
  .schema({
    avatar: cql.scalar.text,
    firstName: cql.scalar.text,
    lastName: cql.scalar.text,

    blockerId: cql.scalar.text,
    blockedId: cql.scalar.text,
    createdAt: cql.scalar.timestamp,
  })
  .primaryKey("blockerId", "blockedId");

export const blocks = blocksBuilder.build();
