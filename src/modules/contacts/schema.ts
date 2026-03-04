import { cql } from "@/cql/cql-types";
import { db } from "@/utils/database";

export const lastMessageBuilder = db.create().type("lastMessage").schema({
  id: cql.scalar.text,
  content: cql.scalar.text,
  timestamp: cql.scalar.timestamp,
  sender_id: cql.scalar.text,
  status: cql.scalar.text,
});

export const lastMessage = lastMessageBuilder.build();

export const contactByUserIdBuilder = db
  .create()
  .table("contact_by_user_id")
  .schema({
    userId: cql.scalar.text,
    contactId: cql.scalar.text,
    firstName: cql.scalar.text,
    lastName: cql.scalar.text,
    handle: cql.scalar.text,
    avatar: cql.scalar.text,
    chatId: cql.scalar.text,
    unread: cql.scalar.text,
    lastMessage: cql.frozen(lastMessage.asType()),
  })
  .primaryKey("user_id", "contact_id");

export const contactByUserId = contactByUserIdBuilder.build();

export const contactByHandleBuilder = db
  .create()
  .table("contact_by_handle")
  .schema({
    userId: cql.scalar.text,
    contactId: cql.scalar.text,
    firstName: cql.scalar.text,
    lastName: cql.scalar.text,
    handle: cql.scalar.text,
    avatar: cql.scalar.text,
    chatId: cql.scalar.text,
    unread: cql.scalar.text,
    lastMessage: cql.frozen(lastMessage.asType()),
  })
  .primaryKey("handle");

export const contactByHandle = contactByHandleBuilder.build();
