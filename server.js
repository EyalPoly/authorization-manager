const express = require("express");
const Logger = require("@eyal-poly/shared-logger");
const secretConfigService = require("./src/services/secretConfigService");
const authRouter = require("./src/routes/authRoutes");
require("dotenv").config();

const logger = Logger.getInstance();

async function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/auth", authRouter);
  app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  await secretConfigService.loadSecrets();

  return app;
}

function startServer() {
  try {
    const app = createApp();

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
}

// Only start the server if this file is being run directly
if (require.main === module) {
  startServer();
}

module.exports = { createApp };
