import socket from "socket.io";
import * as https from "https";

export let io: socket.Server;

export const initSocket = (server: https.Server) => {
  io = new socket.Server(server, {
    cors: { origin: "*" },
  });
  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

export function registerSocketNamespaces(io: socket.Server) {}
