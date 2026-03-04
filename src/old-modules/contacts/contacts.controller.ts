import { extractTokenData } from "@/utils/extract-token-data";
import { verifyAuth } from "@/utils/verify-auth";
import { validateBody } from "@/utils/validate-body";
import { Request, Response, Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { z } from "zod/v4";
import { addContact } from "./add-contact.service";
import { StatusCodes } from "http-status-codes";
import { getContacts } from "./get-contacts.service";

const contactsRouter = Router();

const addContactSchema = z.object({
  username: z.string().nonempty(),
});

contactsRouter.post(
  "/add-contact",
  verifyAuth(),
  validateBody(addContactSchema),
  expressAsyncHandler(async (req: Request, res: Response) => {
    const { id } = await extractTokenData(req.token!);

    const contact = await addContact(req.body.username, id);

    res.status(StatusCodes.CREATED).json(contact);
  }),
);

contactsRouter.get(
  "/contacts",
  verifyAuth(),
  expressAsyncHandler(async (req: Request, res: Response) => {
    const { id } = await extractTokenData(req.token!);

    const contacts = await getContacts(id);

    res.status(StatusCodes.OK).json(contacts);
  }),
);

export default contactsRouter;
