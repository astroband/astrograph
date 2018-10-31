module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  roots: ['<rootDir>/tests/'],
};
