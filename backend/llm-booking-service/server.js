import express from "express";
import bodyParser from "body-parser";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();
app.use(bodyParser.json());
app.use("/api", chatRoutes);


if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Client Service running on http://localhost:${PORT}`);
  });
}

export default app;