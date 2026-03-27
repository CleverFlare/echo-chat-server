import { cql } from "@/cql/cql-types";
import { db } from "@/utils/database";

export const userByIdBuilder = db
  .create()
  .table("userById")
  .schema({
    id: cql.scalar.text,
    handle: cql.scalar.text,
    firstName: cql.scalar.text,
    lastName: cql.scalar.text,
    email: cql.scalar.text,
    phone: cql.scalar.text,
    avatar: cql.scalar.text,
    createdAt: cql.scalar.timestamp,
    bio: cql.scalar.text,
  })
  .primaryKey("id");

export const userById = userByIdBuilder.build();

export const userByPhoneBuilder = db
  .create()
  .table("userByPhone")
  .schema({
    id: cql.scalar.text,
    handle: cql.scalar.text,
    firstName: cql.scalar.text,
    lastName: cql.scalar.text,
    email: cql.scalar.text,
    phone: cql.scalar.text,
    avatar: cql.scalar.text,
    createdAt: cql.scalar.timestamp,
    bio: cql.scalar.text,
  })
  .primaryKey("phone");

export const userByPhone = userByPhoneBuilder.build();

export const userByEmailBuilder = db
  .create()
  .table("userByEmail")
  .schema({
    id: cql.scalar.text,
    handle: cql.scalar.text,
    firstName: cql.scalar.text,
    lastName: cql.scalar.text,
    email: cql.scalar.text,
    phone: cql.scalar.text,
    avatar: cql.scalar.text,
    createdAt: cql.scalar.timestamp,
    bio: cql.scalar.text,
  })
  .primaryKey("email");

export const userByEmail = userByEmailBuilder.build();

export const userByHandleBuilder = db
  .create()
  .table("userByHandle")
  .schema({
    id: cql.scalar.text,
    handle: cql.scalar.text,
    firstName: cql.scalar.text,
    lastName: cql.scalar.text,
    email: cql.scalar.text,
    phone: cql.scalar.text,
    avatar: cql.scalar.text,
    createdAt: cql.scalar.timestamp,
    bio: cql.scalar.text,
  })
  .primaryKey("handle");

export const userByHandle = userByHandleBuilder.build();
