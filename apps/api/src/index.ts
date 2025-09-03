import app from './app.ts';
import process from 'node:process';

const port = parseInt(process.env.PORT || '4000');

console.log(`@lima-garbage/api is live at http://localhost:${port}`);
console.log(`health: http://localhost:${port}/api/health`);

export default {
  port,
  fetch: app.fetch,
};
