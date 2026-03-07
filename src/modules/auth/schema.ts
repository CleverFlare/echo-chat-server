import { cql } from "@/cql/cql-types";
import { db } from "@/utils/database";

export const userByIdBuilder = db
  .create()
  .table("user_by_id")
  .schema({
    id: cql.scalar.text,
    handle: cql.scalar.text,
    first_name: cql.scalar.text,
    last_name: cql.scalar.text,
    email: cql.scalar.text,
    phone: cql.scalar.text,
    avatar: cql.scalar.text,
    created_at: cql.scalar.timestamp,
    bio: cql.scalar.text,
  })
  .primaryKey("id");

export const userById = userByIdBuilder.build();

export const userByPhoneBuilder = db
  .create()
  .table("user_by_phone")
  .schema({
    phone: cql.scalar.text,
    id: cql.scalar.text,
  })
  .primaryKey("phone");

export const userByPhone = userByPhoneBuilder.build();

export const userByEmailBuilder = db
  .create()
  .table("user_by_email")
  .schema({
    email: cql.scalar.text,
    id: cql.scalar.text,
  })
  .primaryKey("email");

export const userByEmail = userByEmailBuilder.build();

export const userByHandleBuilder = db
  .create()
  .table("user_by_handle")
  .schema({
    handle: cql.scalar.text,
    id: cql.scalar.text,
  })
  .primaryKey("handle");

export const userByHandle = userByHandleBuilder.build();
