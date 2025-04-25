// jest.config.js

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  testMatch: ['**/*.test.js'],
  clearMocks: true,
  verbose: true,
};
