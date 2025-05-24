import dotenv from "dotenv";
dotenv.config();

export type ENV = {
  DATABASE_URL: string;
  DATA_CENTER: string;
  KEYSPACE: string;
  HASH_SALT: string;
  JWT_PRIVATE: string;
};

export const env: ENV = {
  DATABASE_URL: process.env.DATABASE_URL!,
  DATA_CENTER: process.env.DATA_CENTER!,
  KEYSPACE: process.env.KEYSPACE!,
  HASH_SALT: process.env.HASH_SALT!,
  JWT_PRIVATE: process.env.JWT_PRIVATE!,
};
