const request = require("supertest");
const { createApp } = require("../server");
const authController = require("../src/controllers/authController");

const app = createApp();

jest.mock("../src/controllers/authController");

jest.mock("@eyal-poly/shared-logger", () => ({
  getInstance: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

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