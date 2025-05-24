import { Router } from "express";
import authRouter from "./modules/auth/auth.controller";

const handlers = Router();

handlers.use(authRouter);

export default handlers;
