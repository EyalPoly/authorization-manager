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
      delete process.env.JWT_SECRET_NAME_POSTFIX;

      expect(() => {
        require("../src/services/secretConfigService"); // Trigger the constructor
      }).toThrowError("JWT_SECRET_NAME_POSTFIX environment variable is required");
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

    it("should log error and throw error if secret loading fails", async () => {
      const error = new Error("Initialization failed");
      mockSecretConfig.initialize.mockRejectedValue(error);

      const service = require("../src/services/secretConfigService");
      
      await expect(service.loadSecrets()).rejects.toThrow(
        "Failed to load secrets: Initialization failed"
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to load secrets", 
        { error: error.message, stack: error.stack }
      );
    });
  });

  describe("get", () => {
    it("should throw error if secret config is not initialized", () => {
      const service = require("../src/services/secretConfigService");
      service.secretConfig = null; // Simulate uninitialized state

      expect(() => {
        service.get("jwtSecret");
      }).toThrowError(
        "Secret config not initialized. Call loadSecrets first."
      );
    });

    it("should return secret value", () => {
      const mockSecrets = { jwtSecret: "secret-value" };
      mockSecretConfig.get.mockReturnValue(mockSecrets);

      const service = require("../src/services/secretConfigService");
      const result = service.get("jwtSecret");

      expect(result).toBe("secret-value");
    });

    it("should throw an error if the key does not exist in secretConfig", () => {
      mockSecretConfig.get.mockReturnValue({});
      const service = require("../src/services/secretConfigService");
      service.secretConfig = mockSecretConfig;
  
      expect(() => service.get("nonExistingKey")).toThrowError(
        'Failed to get secret "nonExistingKey": Secret "nonExistingKey" not found'
      );
  
      // Check that the error was logged
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to get secret", 
        { error: expect.any(Error) }
      );
    });
  });
});
