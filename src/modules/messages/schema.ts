import { cql } from "@/cql/cql-types";
import { db } from "@/shared/database";

export const messageByChatId = db
  .create()
  .table("message_by_chat_id")
  .schema({
    chat_id: cql.scalar.text,
    timestamp: cql.scalar.timestamp,
    id: cql.scalar.text,
    content: cql.scalar.text,
    sender_id: cql.scalar.text,
    status: cql.scalar.text,
    is_edited: cql.scalar.text,
  })
  .primaryKey("chat_id", "timestamp")
  .clusteringOrderBy({ timestamp: "desc" });
