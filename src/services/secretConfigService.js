const { SecretConfig } = require("@eyal-poly/secret-config");
const Logger = require("@eyal-poly/shared-logger");
const logger = Logger.getInstance();
require("dotenv").config();

class SecretConfigService {
  constructor() {
    if (!process.env.JWT_SECRET_NAME_POSTFIX) {
      logger.error("Environment variable JWT_SECRET_NAME_POSTFIX is not set");
      process.exit(1);
    }

    this.secretConfig = new SecretConfig();
    this.secretConfig.addSecret(
      "jwtSecret",
      process.env.JWT_SECRET_NAME_POSTFIX
    );
  }

  async loadSecrets() {
    try {
      logger.info("Loading secrets");
      await this.secretConfig.initialize();
      logger.info("Secrets loaded successfully");
    } catch (err) {
      logger.error("Failed to load secrets", { error: err });
      process.exit(1);
    }
  }

  get(key) {
    try {
      const secretConfig = this.secretConfig.get();
      return secretConfig[key];
    } catch (err) {
      logger.error("Failed to get secret", { error: err });
    }
  }
}

module.exports = new SecretConfigService();
