import { Result } from "@/utils/rust-types";
import { getUserById } from "@/modules/auth/user.service";
import { findChats } from "./repository";

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
            return (await getUserById(chat.otherUserId)).match({
              Ok: (user) =>
                ({
                  userId: chat.userId,
                  otherPartyId: chat.otherUserId,
                  avatar: user.avatar,
                  lastMessage: {
                    content: chat.lastMessage,
                    createdAt: chat.lastMessageAt,
                  },
                  firstName: user.firstName,
                  lastName: user.lastName,
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
