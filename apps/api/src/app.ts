import { Hono } from 'hono';
import { cors } from 'hono/cors';

import authRoutes from '@/routes/auth';
import truckRoutes from '@/routes/trucks';

// Define the context type for Hono requests
// This allows us to pass typed data (like the user object) between middleware
type AppEnv = {
  Variables: {
    user: Awaited<
      ReturnType<typeof import('./lib/auth').auth.getSession>
    >['user'];
  };
};

const app = new Hono<AppEnv>().basePath('/api');

// --- Global Middleware ---

// Configure CORS to allow requests from your frontend clients
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000', // Next.js admin web
      'http://localhost:8081', // Expo Go Metro Bundler
      // Add your production frontend URLs here
    ],
    credentials: true,
  }),
);

// --- Route Mounting ---

app.route('/auth', authRoutes);
app.route('/trucks', truckRoutes);

// A simple health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
