// Main application module: reads the command from the terminal,
// calls the service layer and prints friendly messages.
// Student: SAGAR KUMAR | PRN: SOE25BTAM29 | Section: A
//
// Usage:
//   node src/app.js add "Complete backend assignment"
//   node src/app.js list
//   node src/app.js complete 1
//   node src/app.js delete 1
//   node src/app.js help

import config from './config/config.js';
import { addTask, listTasks, completeTask, deleteTask, TaskError } from './services/taskService.js';

const { appName } = config;

const showHelp = () => {
  console.log(`
${appName} - available commands:
  node src/app.js add "<task title>"   Add a new task
  node src/app.js list                 Show all tasks
  node src/app.js complete <id>        Mark a task as completed
  node src/app.js delete <id>          Delete a task
  node src/app.js help                 Show this help message
`);
};

const printTasks = (tasks) => {
  if (tasks.length === 0) {
    console.log('No tasks found. Add one with: node src/app.js add "Your task"');
    return;
  }

  console.log('ID   STATUS    TITLE                                     CREATED');
  console.log('-'.repeat(78));
  tasks.forEach(({ id, title, completed, createdAt }) => {
    const status = completed ? '[done]' : '[ ]';
    const created = new Date(createdAt).toLocaleString();
    console.log(`${String(id).padEnd(4)} ${status.padEnd(9)} ${title.padEnd(41)} ${created}`);
  });

  const doneCount = tasks.filter(({ completed }) => completed).length;
  console.log('-'.repeat(78));
  console.log(`Total: ${tasks.length} | Completed: ${doneCount} | Pending: ${tasks.length - doneCount}`);
};

// Command handlers stored in an object instead of a long if/else chain.
const commands = {
  add: async (args) => {
    const task = await addTask(args.join(' '));
    console.log(`Task added successfully: "${task.title}" (ID: ${task.id})`);
  },
  list: async () => {
    printTasks(await listTasks());
  },
  complete: async ([id]) => {
    const task = await completeTask(id);
    console.log(`Task ${task.id} marked as completed: "${task.title}"`);
  },
  delete: async ([id]) => {
    const task = await deleteTask(id);
    console.log(`Task deleted successfully: "${task.title}" (ID: ${task.id})`);
  },
  help: async () => showHelp(),
};

const main = async () => {
  const [command = 'help', ...args] = process.argv.slice(2);

  console.log(`=== ${appName} ===`);

  const handler = commands[command.toLowerCase()];
  if (!handler) {
    console.error(`ERROR: Unknown command "${command}".`);
    showHelp();
    process.exitCode = 1;
    return;
  }

  try {
    await handler(args);
  } catch (error) {
    if (error instanceof TaskError) {
      // Expected error caused by user input -> friendly message only.
      console.error(`ERROR: ${error.message}`);
    } else {
      // Unexpected error (file permission, corrupted file, etc.).
      console.error(`ERROR: Something went wrong - ${error.message}`);
    }
    process.exitCode = 1;
  }
};

main();
