const request = require("supertest");
const express = require("express");
const authController = require("../src/controllers/authController");

jest.mock("../src/controllers/authController");

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

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/auth/token", () => {
    it("should call createToken method of authController", async () => {
      authController.createToken.mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });

      const res = await request(app).post("/api/v1/auth/token");

      expect(authController.createToken).toHaveBeenCalledTimes(1);
      expect(res.status).toBe(200);
    });
  });
});
