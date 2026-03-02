import { cql } from "@/cql/cql-types";
import { db } from "@/shared/database";

export const lastMessage = db.create().type("lastMessage").schema({
  id: cql.scalar.text,
  content: cql.scalar.text,
  timestamp: cql.scalar.timestamp,
  sender_id: cql.scalar.text,
  status: cql.scalar.text,
});

export const userContacts = db
  .create()
  .table("userContacts")
  .schema({
    userId: cql.scalar.text,
    contactId: cql.scalar.text,
    firstName: cql.scalar.text,
    lastName: cql.scalar.text,
    username: cql.scalar.text,
    avatarUrl: cql.scalar.text,
    chatId: cql.scalar.text,
    unread: cql.scalar.text,
    lastMessage: cql.frozen(lastMessage.build().asType()),
  })
  .primaryKey("user_id", "contact_id");
