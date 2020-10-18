module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  // restoreMocks: true,
  // clearMocks: true,
  // resetMocks: true,
  setupFilesAfterEnv: ["<rootDir>/tests/unit/setup.ts"]
};
