import { Namespace, Server, Socket } from "socket.io";
import { SocketEvents } from "./types/events";

export type SocketServer = Server | Namespace;

// eslint-disable-next-line
export type SocketHandler<T = any> = (
  socket: Socket,
  io: SocketServer,
  payload: T,
) => Promise<void>;

export type SocketMiddleware = (
  socket: Socket,
  io: SocketServer,
  next: () => void,
) => Promise<void>;

export class SocketRouter {
  private handlers = new Map<string, SocketHandler>();
  private middlewares: SocketMiddleware[] = [];

  use(mw: SocketMiddleware) {
    this.middlewares.push(mw);
    return this;
  }

  on<T extends keyof SocketEvents>(
    event: T,
    handler: SocketHandler<SocketEvents[T]>,
  ) {
    this.handlers.set(event, handler);
    return this;
  }

  register(server: SocketServer) {
    server.on("connection", (socket: Socket) => {
      for (const [event, handler] of this.handlers) {
        socket.on(event, async (payload) => {
          let idx = 0;

          const run = async (): Promise<void> => {
            const mw = this.middlewares[idx++];
            if (mw) {
              await mw(socket, server, run);
            } else {
              await handler(socket, server, payload);
            }
          };

          try {
            await run();
          } catch (err) {
            console.error("Socket error:", err);
          }
        });
      }
    });
  }
}
