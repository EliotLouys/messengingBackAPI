import "dotenv/config";
import express from "express";
import router from "./routes/routes";
import { initDb } from "./repositories/initDb";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger-output.json"; // This file will be auto-generated

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.use(express.json()); // Parse incoming JSON
app.use(router); // Attach routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
initDb();

// Listen on 0.0.0.0 to expose to the network
app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Network: http://<YOUR_IP_ADDRESS>:${PORT}`);
});
