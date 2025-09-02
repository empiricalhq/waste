import app from '@/app';

const port = parseInt(process.env.PORT || '4000');

console.log(`@lima-garbage/api is running at http://localhost:${port}`);
console.log(`Check the health status at: http://localhost:${port}/api/health`);

export default {
  port,
  fetch: app.fetch,
};
