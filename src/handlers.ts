import { Router } from "express";
import authRouter from "./old-modules/auth/auth.controller";
import profileRouter from "./old-modules/profile/profile.controller";
import contactsRouter from "./old-modules/contacts/contacts.controller";
import messagesRouter from "./old-modules/messages/messages.controller";
import { Socket, Server } from "socket.io";
import { setupMessagingSockets } from "./old-modules/messages/messages.gateway";
import { setupHandshakeAuth } from "./old-modules/auth/auth.gateway";
import { setupVisibilityGateway } from "./old-modules/visibility/visibility.gateway";

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
  setupVisibilityGateway,
];

export { httpHandlers, socketHandlers };
