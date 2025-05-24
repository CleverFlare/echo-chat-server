import { validateBody } from "@/shared/validate-body";
import { Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import { z } from "zod/v4";
import { login } from "./login.service";
import { register } from "./register.service";

const authRouter = Router();

const loginSchema = z.object({
  username: z.string().nonempty(),
  password: z.string().min(8),
});

const MAX_AGE = 60 * 60 * 24 * 7;

authRouter.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const token = await login(req.body);

    res
      .cookie("OutSiteJWT", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: MAX_AGE,
        path: "/",
        partitioned: true,
      })
      .status(StatusCodes.OK)
      .json({ token });
  }),
);

const registerSchema = z.object({
  username: z.string().nonempty(),
  password: z.string().min(8),
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  email: z.string().nonempty(),
});

authRouter.post(
  "/register",
  validateBody(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const token = await register(req.body);

    res
      .cookie("OutSiteJWT", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: MAX_AGE,
        path: "/",
        partitioned: true,
      })
      .status(StatusCodes.CREATED)
      .json({ token });
  }),
);

authRouter.get(
  "/logout",
  asyncHandler(async (_: Request, res: Response) => {
    res
      .cookie("OutSiteJWT", null, {
        maxAge: -1,
      })
      .status(StatusCodes.OK)
      .send("Successful");
  }),
);

export default authRouter;
