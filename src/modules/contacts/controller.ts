import { authMiddleware } from "@/utils/auth";
import Elysia from "elysia";
import { z } from "zod/v4";
import { addContact } from "./add-contact.service";
import { publish, subscribe } from "@/event-bus";
import { getContact } from "./get-contact.service";
import logger from "@/utils/logger";
import { getContacts } from "./get-contacts.service";

export const contactsRouter = new Elysia()
  .use(authMiddleware)
  .get(
    "/contacts",
    async ({ status, user }) => {
      const contactsResult = await getContacts(user.id);

      return contactsResult.match({
        Ok: (contacts) => status("OK", contacts) as unknown,
        Err: (error) => status("Internal Server Error", error.message),
      });
    },
    { auth: true },
  )
  .post(
    "/add-contact",
    async ({ user, body: { handle }, status }) => {
      await addContact(user.id, handle);

      const contactResult = await getContact(handle);

      contactResult.match({
        Ok: (contact) => publish(`new-contacts:${contact.user_id}`, contact),
        // eslint-disable-next-line
        Err: (_) => logger.error("Couldn't notify user of a new contact"),
      });

      return status("Created", "Added");
    },
    {
      body: z.object({ handle: z.string() }),
      auth: true,
    },
  )
  .ws("/new-contacts", {
    open({ data: { user }, send }) {
      subscribe(`new-contacts:${user.id}`, (contact) => {
        send(contact);
      });
    },
    auth: true,
  });
