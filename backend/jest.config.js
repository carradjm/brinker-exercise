// backend/jest.config.js

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.{js,ts}', '!**/node_modules/**'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
