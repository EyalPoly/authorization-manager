const AuthService = require("../src/services/authService");
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken", () => ({
  decode: jest.fn(),
  sign: jest.fn(),
}));

jest.mock("@eyal-poly/shared-logger", () => ({
  getInstance: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe("AuthService Tests", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createToken", () => {
    it("should create token successfully", async () => {
      jwt.decode.mockReturnValue({ uid: "test-uid" });
      jwt.sign.mockReturnValue("test-token");

      const token = await AuthService.createToken("test-firebase-token");

      expect(jwt.decode).toHaveBeenCalledWith("test-firebase-token");
      expect(jwt.sign).toHaveBeenCalledWith(
        { uid: "test-uid" },
        "test-secret",
        {
          expiresIn: "1h",
        }
      );
      expect(token).toBe("test-token");
    });

    it("should throw error if firebase token is invalid", async () => {
      jwt.decode.mockReturnValue(null);

      await expect(
        AuthService.createToken("test-firebase-token")
      ).rejects.toThrow("Invalid Firebase token");
    });
  });
});
