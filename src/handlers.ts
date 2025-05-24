import { Router } from "express";
import authRouter from "./modules/auth/auth.controller";
import profileRouter from "./modules/profile/profile.controller";

const handlers = Router();

handlers.use(authRouter);
handlers.use(profileRouter);

export default handlers;
