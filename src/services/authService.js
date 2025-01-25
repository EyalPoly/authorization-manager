const Logger = require("@eyal-poly/shared-logger");
const secretConfigService = require("./secretConfigService");
const jwt = require("jsonwebtoken");

const logger = Logger.getInstance();

class AuthService {
  async createToken(firebaseToken) {
    logger.debug("Creating token", { firebaseToken });

    const decodedToken = this.decodeToken(firebaseToken);

    const jwtSecret = secretConfigService.get("jwtSecret");
    if (!jwtSecret) {
      const error = new Error("JWT secret not found");
      error.status = 500;
      logger.error("JWT secret not found", { error });
      throw error;
    }
    const token = jwt.sign({ uid: decodedToken.uid }, jwtSecret, {
      expiresIn: "1h",
    });

    logger.debug("Token created", { token });

    return token;
  }

  decodeToken(firebaseToken) {
    const decodedToken = jwt.decode(firebaseToken);
    if (!decodedToken?.uid) {
      const error = new Error("Invalid Firebase token");
      error.status = 401;
      logger.error("Invalid Firebase token", { error });
      throw error;
    }

    return decodedToken;
  }
}

module.exports = new AuthService();
