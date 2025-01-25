const AuthService = require("../src/services/authService");
const jwt = require("jsonwebtoken");
const secretConfigService = require("../src/services/secretConfigService");

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

jest.mock("../src/services/secretConfigService", () => ({
  get: jest.fn(),
}));

describe("AuthService Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    secretConfigService.get.mockReturnValue("test-secret");
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

    it("should throw error if JWT secret is not found", async () => {
      jwt.decode.mockReturnValue({ uid: "test-uid" });
      secretConfigService.get.mockReturnValue(null);

      await expect(
        AuthService.createToken("test-firebase-token")
      ).rejects.toThrow("JWT secret not found");
    });
  });
});
