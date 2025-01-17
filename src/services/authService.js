const Logger = require("@eyal-poly/shared-logger");
const logger = Logger.getInstance();
const jwt = require("jsonwebtoken");

class AuthService {
  async createToken(firebaseToken) {
    logger.debug("Creating token", { firebaseToken });

    const decodedToken = jwt.decode(firebaseToken);
    if (!decodedToken?.uid) {
      const error = new Error("Invalid Firebase token");
      error.status = 401;
      logger.error("Invalid Firebase token", { error });
      throw error;
    }

    const token = jwt.sign({ uid: decodedToken.uid }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    logger.debug("Token created", { token });

    return token;
  }
}

module.exports = new AuthService();
