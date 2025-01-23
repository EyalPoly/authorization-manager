const request = require("supertest");
const { createApp } = require("../server");

jest.mock("../src/routes/authRoutes", () => {
  const express = require("express");
  const router = express.Router();

  router.post("/token", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Token created",
      token: "test-token",
    });
  });

  return router;
});

jest.mock("@eyal-poly/shared-logger", () => ({
  getInstance: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

let app;

beforeAll(() => {
  app = createApp();
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.clearAllMocks();
});

describe("Server Tests", () => {
  describe("404 Handler", () => {
    it("should return 404 for unknown routes", async () => {
      const res = await request(app).get("/api/v1/unknown");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Route not found" });
    });
  });

  describe("Auth Routes", () => {
    it("should successfully create token", async () => {
      const res = await request(app).post("/api/v1/auth/token");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Token created",
        token: "test-token",
      });
    });

    it("should handle invalid auth route", async () => {
      const res = await request(app).post("/api/v1/auth/invalid");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Route not found" });
    });
  });
});
