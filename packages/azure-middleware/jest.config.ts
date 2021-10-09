import { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  preset: 'ts-jest',
  verbose: true,
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  coverageDirectory: './tests/jest/coverage',
  errorOnDeprecated: true,
  rootDir: '.',
  roots: ['./tests/jest'],
};

export default config;
