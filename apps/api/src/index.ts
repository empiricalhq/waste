import app from './app';

const port = parseInt(process.env.PORT || '4000');

console.log(`🚀 API server running at http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
