import { verifyAuth } from "@/shared/utils/verify-auth";
import { Request, Response, Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { getMessagesByChatId } from "./get-messages-by-chat-id.service";
import { StatusCodes } from "http-status-codes";

const messagesRouter = Router();

messagesRouter.get(
  "/messages/:chatId",
  verifyAuth(),
  expressAsyncHandler(async (req: Request, res: Response) => {
    const messages = await getMessagesByChatId(req.params.chatId);

    res.status(StatusCodes.OK).json(messages);
  }),
);

export default messagesRouter;
