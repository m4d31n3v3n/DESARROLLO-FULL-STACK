module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'server.js',
    'middleware/**/*.js',
  ],
  testMatch: ['**/tests/**/*.test.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
};
