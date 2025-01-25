jest.mock("@eyal-poly/secret-config");
jest.mock("@eyal-poly/shared-logger");

jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

describe("SecretConfigService", () => {
  let mockLogger;
  let mockSecretConfig;
  const originalEnv = { ...process.env };
  const testJwtNamePostfix = "JWT_SECRET_TEST";

  beforeEach(() => {
    jest.resetModules();

    const { SecretConfig } = require("@eyal-poly/secret-config");
    const Logger = require("@eyal-poly/shared-logger");

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    Logger.getInstance.mockReturnValue(mockLogger);

    mockSecretConfig = {
      addSecret: jest.fn(),
      initialize: jest.fn(),
      get: jest.fn(),
    };
    SecretConfig.mockImplementation(() => mockSecretConfig);

    process.env.JWT_SECRET_NAME_POSTFIX = testJwtNamePostfix;
  });

  afterAll(() => {
    process.env = { ...originalEnv };
  });

  describe("Constructor", () => {
    it("should exit process if JWT_SECRET_NAME_POSTFIX is not set", () => {
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;
      delete process.env.JWT_SECRET_NAME_POSTFIX;

      try {
        // Trigger constructor
        require("../src/services/secretConfigService");
      } finally {
        process.exit = originalExit;
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Environment variable JWT_SECRET_NAME_POSTFIX is not set"
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("should add secret with correct configuration", () => {
      require("../src/services/secretConfigService");

      expect(mockSecretConfig.addSecret).toHaveBeenCalledWith(
        "jwtSecret",
        testJwtNamePostfix
      );
    });
  });

  describe("loadSecrets", () => {
    it("should successfully load secrets", async () => {
      mockSecretConfig.initialize.mockResolvedValue();

      const service = require("../src/services/secretConfigService");
      await service.loadSecrets();

      expect(mockSecretConfig.initialize).toHaveBeenCalled();
    });

    it("should exit process if secret loading fails", async () => {
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      const error = new Error("Initialization failed");
      mockSecretConfig.initialize.mockRejectedValue(error);

      try {
        const service = require("../src/services/secretConfigService");
        await service.loadSecrets();

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Failed to load secrets",
          { error }
        );
        expect(mockExit).toHaveBeenCalledWith(1);
      } finally {
        process.exit = originalExit;
      }
    });
  });

  describe("get", () => {
    it("should return secret value", () => {
      const mockSecrets = { jwtSecret: "secret-value" };
      mockSecretConfig.get.mockReturnValue(mockSecrets);

      const service = require("../src/services/secretConfigService");
      const result = service.get("jwtSecret");

      expect(result).toBe("secret-value");
    });

    it("should log error if getting secret fails", () => {
      const error = new Error("Get secret failed");
      mockSecretConfig.get.mockImplementation(() => {
        throw error;
      });

      const service = require("../src/services/secretConfigService");
      service.get("jwtSecret");

      expect(mockLogger.error).toHaveBeenCalledWith("Failed to get secret", {
        error,
      });
    });
  });
});
