// Configuration module: loads settings from the .env file using dotenv.
// No configuration value is hardcoded anywhere else in the application.
// Student: SAGAR KUMAR | PRN: SOE25BTAM29 | Section: A

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Project root = two folders above this file (src/config -> project root).
// This lets the app work even if it is started from another folder.
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

dotenv.config({ path: path.join(projectRoot, '.env') });

const REQUIRED_VARIABLES = ['APP_NAME', 'DATA_FILE'];

const missing = REQUIRED_VARIABLES.filter((name) => !process.env[name]?.trim());

// Stop early with a clear message instead of failing later with a confusing error.
if (missing.length > 0) {
  console.error(`CONFIG ERROR: Missing environment variable(s): ${missing.join(', ')}`);
  console.error('Create a .env file by copying .env.example (see README.md), then run the command again.');
  process.exit(1);
}

const { APP_NAME, DATA_FILE } = process.env;

const config = Object.freeze({
  appName: APP_NAME.trim(),
  // Relative paths in .env are resolved from the project root.
  dataFile: path.resolve(projectRoot, DATA_FILE.trim()),
});

export default config;
