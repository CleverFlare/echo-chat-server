import { cql } from "@/cql/cql-types";
import { db } from "@/shared/database";

export const connectedBySocketId = db
  .create()
  .table("connectedBySocketId")
  .schema({ user_id: cql.scalar.text, socket_id: cql.scalar.text })
  .primaryKey("socket_id");

export const connectedByUserId = db
  .create()
  .table("connectedByUserId")
  .schema({ user_id: cql.scalar.text, socket_id: cql.scalar.text })
  .primaryKey("user_id");

export const userByUsername = db
  .create()
  .table("userByUsername")
  .schema({
    username: cql.scalar.text,
    password_hash: cql.scalar.text,
    id: cql.scalar.text,
    created_at: cql.scalar.timestamp,
  })
  .primaryKey("username");

export const userById = db
  .create()
  .table("userById")
  .schema({
    id: cql.scalar.text,
    username: cql.scalar.text,
    password_hash: cql.scalar.text,
    first_name: cql.scalar.text,
    last_name: cql.scalar.text,
    email: cql.scalar.text,
    avatar_url: cql.scalar.text,
    created_at: cql.scalar.text,
    bio: cql.scalar.text,
  })
  .primaryKey("id");
