import app from './app';

const port = parseInt(process.env.PORT || '4000');

console.log(`🚀 Lima Garbage API running at http://localhost:${port}`);
console.log(`📊 Health check: http://localhost:${port}/api/health`);

export default {
  port,
  fetch: app.fetch,
};
