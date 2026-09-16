import { io } from "socket.io-client";

let socket = null;

export const initializedSocketConnection = () => {
    if (socket) return socket;

    socket = io(import.meta.env.VITE_BACKEND_URL, {
        withCredentials: true,
    })

    socket.on("connect", () => {
        console.log("Connected to Socket.IO server");
    })

    return socket;
}