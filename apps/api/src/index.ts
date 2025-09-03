import app from '@/app.ts';

const port = parseInt(process.env.PORT || '4000');

console.log(`@lima-garbage/api is live at http://localhost:${port}`);
console.log(`health: http://localhost:${port}/api/health`);

export default {
  port,
  fetch: app.fetch,
};
