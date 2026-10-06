// Data module (repository): the ONLY place that reads/writes the JSON file.
// All file operations are asynchronous and use fs/promises.
// Student: SAGAR KUMAR | PRN: SOE25BTAM29 | Section: A

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import config from '../config/config.js';

const { dataFile } = config;

// Reads all tasks. If the file does not exist yet, start with an empty list.
export const readTasks = async () => {
  try {
    const content = await readFile(dataFile, 'utf8');
    if (!content.trim()) return [];

    const tasks = JSON.parse(content);
    if (!Array.isArray(tasks)) {
      throw new SyntaxError('Data file must contain a JSON array.');
    }
    return tasks;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    if (error instanceof SyntaxError) {
      throw new Error(`The data file "${path.basename(dataFile)}" is corrupted (invalid JSON). Fix it or replace its content with [].`);
    }
    throw error;
  }
};

// Saves all tasks. Creates the data folder automatically if it is missing.
export const saveTasks = async (tasks) => {
  await mkdir(path.dirname(dataFile), { recursive: true });
  await writeFile(dataFile, `${JSON.stringify(tasks, null, 2)}\n`, 'utf8');
};
