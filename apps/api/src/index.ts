import process from 'node:process';
import app from '@/app.ts';

const port = Number.parseInt(process.env.PORT || '4000', 10);

console.log(`@lima-garbage/api is live at http://localhost:${port}`);
console.log(`health: http://localhost:${port}/api/health`);

export default {
  port,
  fetch: app.fetch,
};
