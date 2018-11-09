module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageReporters: ["text", "text-summary", "json"],
  coverageDirectory: "coverage",
  roots: ["<rootDir>/tests/"],
};
