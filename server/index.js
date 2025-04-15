import { app } from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
    },
});

app.set("io", io);

const PORT = Number(process.env.PORT || 3001);

io.on("connection", (socket) => {
    console.log("A user connected: ", socket.id);

    socket.on("join_room", (playlistId) => {
        socket.join(playlistId);
        console.log("User joined playlist room: ", playlistId);
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port: http://localhost:${PORT}`);
});
