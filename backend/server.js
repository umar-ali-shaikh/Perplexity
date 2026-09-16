import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import http from "http";
import { initSocket } from "./src/sockets/server.socket.js";

const PORT = process.env.PORT || 5000;


connectDB()
    .then(() => {
        // Create HTTP server
        const server = http.createServer(app);

        // Initialize Socket.IO
        initSocket(server);

        // Start server
        server.listen(PORT, () => {
            console.log(`Server has started at ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed:", err);
        process.exit(1);
    });