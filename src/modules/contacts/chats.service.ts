import { Result } from "@/utils/rust-types";
import { findChats } from "./repository";
import { getUserById } from "../auth/user.service";

type Chat = {
  userId: string;
  otherPartyId: string;
  avatar: string | null;
  firstName: string;
  lastName: string;
  lastMessage: { content: string; createdAt: Date };
};

export async function getChatsByUserId(
  userId: string,
): Promise<Result<Chat[], Error>> {
  try {
    const chats = (await findChats(userId)).match({
      Ok: (chats) =>
        Promise.all(
          chats.map(async (chat) => {
            return (await getUserById(chat.other_user_id)).match({
              Ok: (user) =>
                ({
                  userId: chat.user_id,
                  otherPartyId: chat.other_user_id,
                  avatar: user.avatar,
                  lastMessage: {
                    content: chat.last_message,
                    createdAt: chat.last_message_at,
                  },
                  firstName: user.first_name,
                  lastName: user.last_name,
                }) as Chat,
              Err: (error) => {
                throw error;
              },
            });
          }),
        ),
      Err: (error) => {
        throw error;
      },
    });

    return Result.Ok(await chats);
  } catch (err) {
    return Result.Err(err as Error);
  }
}
