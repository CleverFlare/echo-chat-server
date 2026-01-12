import socket from "socket.io";
import http from "http";

export let io: socket.Server;

export const initSocket = (server: http.Server) => {
  io = new socket.Server(server, {
    cors: { origin: "*" }, // customize if needed
  });
  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

export function registerSocketNamespaces(io: socket.Server) {}
