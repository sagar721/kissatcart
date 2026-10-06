// Service module (business logic): validation and task operations.
// It uses the repository for storage, so it never touches files directly.
// Student: SAGAR KUMAR | PRN: SOE25BTAM29 | Section: A

import { readTasks, saveTasks } from '../data/taskRepository.js';

const MAX_TITLE_LENGTH = 100;

// Custom error for problems caused by user input (expected errors).
export class TaskError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TaskError';
  }
}

// ---------- Validation helpers ----------
const validateTitle = (title) => {
  const cleanTitle = String(title ?? '').trim();
  if (!cleanTitle) {
    throw new TaskError('Task title cannot be empty. Usage: node src/app.js add "Your task title"');
  }
  if (cleanTitle.length > MAX_TITLE_LENGTH) {
    throw new TaskError(`Task title is too long (${cleanTitle.length} characters). Maximum allowed is ${MAX_TITLE_LENGTH}.`);
  }
  return cleanTitle;
};

const parseId = (value) => {
  const id = Number(value);
  if (value === undefined || !Number.isInteger(id) || id <= 0) {
    throw new TaskError(`Invalid task ID "${value ?? ''}". The ID must be a positive whole number.`);
  }
  return id;
};

const findTaskIndex = (tasks, id) => {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    throw new TaskError(`Task with ID ${id} was not found.`);
  }
  return index;
};

// ---------- Task operations (all async) ----------
export const addTask = async (title) => {
  const cleanTitle = validateTitle(title);
  const tasks = await readTasks();

  const duplicate = tasks.some((task) => task.title.toLowerCase() === cleanTitle.toLowerCase());
  if (duplicate) {
    throw new TaskError(`A task with the title "${cleanTitle}" already exists.`);
  }

  const nextId = tasks.length > 0 ? Math.max(...tasks.map(({ id }) => id)) + 1 : 1;
  const newTask = {
    id: nextId,
    title: cleanTitle,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  await saveTasks([...tasks, newTask]);
  return newTask;
};

export const listTasks = async () => readTasks();

export const completeTask = async (idValue) => {
  const id = parseId(idValue);
  const tasks = await readTasks();
  const index = findTaskIndex(tasks, id);

  if (tasks[index].completed) {
    throw new TaskError(`Task with ID ${id} is already completed.`);
  }

  tasks[index] = { ...tasks[index], completed: true, completedAt: new Date().toISOString() };
  await saveTasks(tasks);
  return tasks[index];
};

export const deleteTask = async (idValue) => {
  const id = parseId(idValue);
  const tasks = await readTasks();
  const index = findTaskIndex(tasks, id);

  const [deletedTask] = tasks.splice(index, 1);
  await saveTasks(tasks);
  return deletedTask;
};
