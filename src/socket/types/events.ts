export interface SocketEvents {
  "chat:send": { roomId: string; content: string };
  "chat:receive": { id: string; content: string };
}
