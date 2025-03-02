import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
    path: "./.env",
});

const PORT = Number(process.env.PORT || 3001);

app.listen(PORT, () => {
    console.log(`Listening on port: http://localhost:${PORT}`);
});
