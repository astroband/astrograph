module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: ['text', 'text-summary'],
  roots: ['<rootDir>/tests/'],
};
