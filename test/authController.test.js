const request = require("supertest");
const express = require("express");
const authController = require("../src/controllers/authController");
const authService = require("../src/services/authService");

jest.mock("../src/services/authService", () => ({
  createToken: jest.fn(),
}));

jest.mock("@eyal-poly/shared-logger", () => ({
  getInstance: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

const app = express();
app.use(express.json());
app.post("/api/v1/auth/token", authController.createToken);

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createToken", () => {
    it("should return 200 and token", async () => {
      authService.createToken.mockResolvedValue("test-token");

      const res = await request(app)
        .post("/api/v1/auth/token")
        .set("Authorization", "Bearer firebase-token");

      expect(authService.createToken).toHaveBeenCalledTimes(1);
      expect(authService.createToken).toHaveBeenCalledWith("firebase-token");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Token created",
        token: "test-token",
      });
    });

    it("should return 401 when no token is provided", async () => {
      const res = await request(app).post("/api/v1/auth/token");

      expect(authService.createToken).not.toHaveBeenCalled();
      expect(res.status).toBe(401);
    });

    it("should handle errors", async () => {
      authService.createToken.mockRejectedValue(new Error("Test error"));

      const res = await request(app)
        .post("/api/v1/auth/token")
        .set("Authorization", "Bearer firebase-token");

      expect(authService.createToken).toHaveBeenCalledTimes(1);
      expect(authService.createToken).toHaveBeenCalledWith("firebase-token");
      expect(res.status).toBe(500);
    });
  });
});
