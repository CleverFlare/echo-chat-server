import { Router } from "express";
import authRouter from "./modules/auth/auth.controller";
import profileRouter from "./modules/profile/profile.controller";
import contactsRouter from "./modules/contacts/contacts.controller";

const handlers = Router();

handlers.use(authRouter);
handlers.use(profileRouter);
handlers.use(contactsRouter);

export default handlers;
