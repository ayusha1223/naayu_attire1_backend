export default {
  testEnvironment: "node",

  // where tests are located
  testMatch: [
    "**/__tests__/**/*.test.js"
  ],

  // load environment variables
  setupFiles: ["dotenv/config"],

  // clear mocks automatically
  clearMocks: true,

  verbose: true
};