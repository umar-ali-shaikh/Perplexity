import { Server, Socket } from "socket.io";

let io;
export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        }
    })

    io.on("connection", (socket) => {
        console.log("A user connected: " + socket.id)
    })
}

export function getIo() {
    if (!io) {
        throw new Error("Socket.io not initialized")
    }

    return io
}