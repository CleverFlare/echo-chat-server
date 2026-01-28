import { cassandra } from "@/shared/database";

export const connectedBySocketId = cassandra
  .create()
  .table("connectedBySocketId")
  .definitions({
    columns: { userId: "TEXT", socketId: "TEXT" },
    primaryKey: ["socketId"],
  });

export const connectedByUserId = cassandra
  .create()
  .table("connectedByUserId")
  .definitions({
    columns: { userId: "TEXT", socketId: "TEXT" },
    primaryKey: ["userId"],
  });

export const userByUsername = cassandra
  .create()
  .table("userByUsername")
  .definitions({
    columns: {
      username: "TEXT",
      passwordHash: "TEXT",
      id: "TEXT",
      createdAt: "TIMESTAMP",
    },
    primaryKey: ["username"],
  });

export const userById = cassandra
  .create()
  .table("userById")
  .definitions({
    columns: {
      id: "TEXT",
      username: "TEXT",
      passwordHash: "TEXT",
      firstName: "TEXT",
      lastName: "TEXT",
      email: "TEXT",
      avatarUrl: "TEXT",
      createdAt: "TIMESTAMP",
      bio: "TEXT",
    },
    primaryKey: ["id"],
  });
