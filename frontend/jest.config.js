// jest.config.js

module.exports = {
  preset: 'ts-jest', // Use ts-jest preset
  testEnvironment: 'jsdom', // Use jsdom for testing React components
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Transform TypeScript files using ts-jest
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // Recognize these file extensions
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'identity-obj-proxy', // Mock CSS imports
  },
  transformIgnorePatterns: [
    'node_modules/(?!axios)', // Transform axios module if necessary
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Jest setup file
};
