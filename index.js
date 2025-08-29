import express from "express";
import userRoute from "./route/index.js";
import cors from "cors";
import "body-parser";
import accountRoute from "./route/accounts.js";

// Using cors
import { configDotenv } from "dotenv";
configDotenv();

const app = express();

// Middleare
app.use(cors());
app.use(express.json());

app.use("/api/v1/user", userRoute);
app.use("/api/v1/account", accountRoute);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});
