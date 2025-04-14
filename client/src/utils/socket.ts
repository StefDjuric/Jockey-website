import io from "socket.io-client";

const socket = io.connect("https://jockey-website.onrender.com");

export { socket };
