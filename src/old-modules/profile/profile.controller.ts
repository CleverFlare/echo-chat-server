import { verifyAuth } from "@/utils/verify-auth";
import { Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";
import { getProfileById, getProfileByToken } from "./get-profile.service";
import { StatusCodes } from "http-status-codes";

const profileRouter = Router();

profileRouter.get(
  "/profile",
  verifyAuth(),
  asyncHandler(async (req: Request, res: Response) => {
    const profile = await getProfileByToken(req.token!);

    res.status(StatusCodes.OK).json(profile);
  }),
);

profileRouter.get(
  "/profile/:id",
  verifyAuth(),
  asyncHandler(async (req: Request, res: Response) => {
    const profile = await getProfileById(req.params.id!);

    res.status(StatusCodes.OK).json(profile);
  }),
);

export default profileRouter;
