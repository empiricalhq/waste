import { app } from '@/app';
import { loadConfig } from '@/internal/shared/config/config';

const config = loadConfig();
const port = config.server.port;

// biome-ignore lint/style/noDefaultExport: hono requires default export
export default {
  port,
  fetch: app.fetch,
};
