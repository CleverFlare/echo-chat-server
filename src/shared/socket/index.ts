// src/socket/index.ts
import { Server as IOServer } from "socket.io";
import http from "http";

let io: IOServer;

export const initSocket = (server: http.Server) => {
  io = new IOServer(server, {
    cors: { origin: "*" }, // customize if needed
  });
  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
