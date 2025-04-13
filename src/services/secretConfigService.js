const Logger = require("@eyal-poly/shared-logger");
const { SecretConfig } = require("@eyal-poly/secret-config");
const logger = Logger.getInstance();
require("dotenv").config();

class SecretConfigService {
  constructor() {
    if (!process.env.JWT_SECRET_NAME_POSTFIX) {
      logger.error("Environment variable JWT_SECRET_NAME_POSTFIX is not set");
      throw new Error("JWT_SECRET_NAME_POSTFIX environment variable is required");
    }

    try {
      this.secretConfig = new SecretConfig();
      this.secretConfig.addSecret(
        "jwtSecret",
        process.env.JWT_SECRET_NAME_POSTFIX
      );
    } catch (error) {
      logger.error("Error initializing SecretConfig", { error });
      throw new Error("Failed to initialize SecretConfig: " + error.message);
    }
  }

  async loadSecrets() {
    try {
      logger.info("Loading secrets");
      await this.secretConfig.initialize();
      logger.info("Secrets loaded successfully");
    } catch (err) {
      logger.error("Failed to load secrets", {
        error: err.message,
        stack: err.stack,
      });
      throw new Error("Failed to load secrets: " + err.message);
    }
  }

  get(key) {
    try {
      if (!this.secretConfig) {
        throw new Error("Secret config not initialized. Call loadSecrets first.");
      }

      const secretConfig = this.secretConfig.get();
      
      if (!secretConfig || !(key in secretConfig)) {
        throw new Error(`Secret "${key}" not found`);
      }

      return secretConfig[key];
    } catch (err) {
      logger.error("Failed to get secret", { error: err });
      throw new Error(`Failed to get secret "${key}": ${err.message}`);
    }
  }
}

module.exports = new SecretConfigService();
