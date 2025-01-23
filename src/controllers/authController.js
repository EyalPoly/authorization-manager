const Logger = require("@eyal-poly/shared-logger");
const logger = Logger.getInstance();
const authService = require("../services/authService");

class AuthController {
  async createToken(req, res, next) {
    try {
      const firebaseToken = req.headers.authorization?.split("Bearer ")[1];
      if (!firebaseToken) {
        const error = new Error("Firebase token is required");
        error.status = 401;
        logger.error("Firebase token is required", { error });
        throw error;
      }

      const token = await authService.createToken(firebaseToken);

      logger.info("Token created", { token });

      return res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        .json({ success: true, message: "Token created"});
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
