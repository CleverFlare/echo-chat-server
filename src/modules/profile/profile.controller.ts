import { verifyAuth } from "@/shared/utils/verify-auth";
import { Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";
import { getProfile } from "./get-profile.service";
import { StatusCodes } from "http-status-codes";

const profileRouter = Router();

profileRouter.get(
  "/profile",
  verifyAuth(),
  asyncHandler(async (req: Request, res: Response) => {
    const profile = await getProfile(req.token!);

    res.status(StatusCodes.OK).json(profile);
  }),
);

export default profileRouter;
