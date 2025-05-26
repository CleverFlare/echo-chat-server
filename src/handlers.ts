import { Router } from "express";
import authRouter from "./modules/auth/auth.controller";
import profileRouter from "./modules/profile/profile.controller";
import contactsRouter from "./modules/contacts/contacts.controller";
import messagesRouter from "./modules/messages/messages.controller";
import { Socket, Server } from "socket.io";
import { setupMessagingSockets } from "./modules/messages/messages.gateway";
import { setupHandshakeAuth } from "./modules/auth/auth.gateway";

export type SocketHandler = (
  socket: Socket,
  io: Server,
) => void | Promise<void>;

const httpHandlers = Router();

httpHandlers.use(authRouter);
httpHandlers.use(profileRouter);
httpHandlers.use(contactsRouter);
httpHandlers.use(messagesRouter);

const socketHandlers: SocketHandler[] = [
  setupHandshakeAuth,
  setupMessagingSockets,
];

export { httpHandlers, socketHandlers };
