import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import { verifyAuthToken } from "../utils/jwt-verification";

let io: IOServer | null = null;

export function initSocketServer(server: HttpServer) {
  io = new IOServer(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    try {
      const authToken =
        socket.handshake.auth?.token ||
        String(socket.handshake.headers.authorization || "").replace(
          /^Bearer\s+/i,
          "",
        );

      if (!authToken) {
        throw new Error(
          "Authentication token is required for socket connection",
        );
      }

      const decoded = verifyAuthToken(authToken);
      if (!decoded?.id) {
        throw new Error("Invalid authentication payload");
      }

      socket.data.userId = String(decoded.id);
      next();
    } catch (error) {
      next(new Error("Unauthorized socket connection"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    if (userId) {
      socket.join(userId);
    }
  });
}

export function emitNotificationToUser(userId: string, notification: unknown) {
  if (!io) return;
  io.to(userId).emit("notification", notification);
}

export function getSocketServerInstance() {
  return io;
}
