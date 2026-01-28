import { collection } from "@/cassandra/types";
import { cassandra } from "@/shared/database";

export const lastMessage = cassandra
  .create()
  .type("lastMessage")
  .definitions({
    id: "TEXT",
    content: "TEXT",
    timestamp: "TIMESTAMP",
    senderId: "TEXT",
    status: "TEXT",
  })
  .build();

export const userContacts = cassandra
  .create()
  .table("userContacts")
  .definitions({
    columns: {
      userId: "TEXT",
      contactId: "TEXT",
      firstName: "TEXT",
      lastName: "TEXT",
      username: "TEXT",
      avatarUrl: "TEXT",
      chatId: "TEXT",
      unread: "TEXT",
      lastMessage: collection.frozen(lastMessage.reference()),
    },
  });
