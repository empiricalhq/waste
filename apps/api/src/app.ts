import { cors } from 'hono/cors';
import createApp from '@/lib/create-app';
import authRoutes from '@/routes/auth';
import truckRoutes from '@/routes/trucks';
import adminRoutes from '@/routes/admin';

const app = createApp();

// CORS middleware
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000', // Next.js admin
      'http://localhost:8081', // Expo Metro
    ],
    credentials: true,
  }),
);

// Routes
const routes = [
  { path: '/auth', router: authRoutes },
  { path: '/trucks', router: truckRoutes },
  { path: '/admin', router: adminRoutes },
] as const;

routes.forEach(({ path, router }) => {
  app.basePath('/api').route(path, router);
});

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

export default app;
