import express from "express";
import userRoute from "./route/index.js";
import cors from "cors";
import "body-parser";

// Using cors
import { configDotenv } from "dotenv";
configDotenv();

const app = express();

// Middleare
app.use(cors());
app.use(express.json());

app.use("/api/v1/user", userRoute);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});
