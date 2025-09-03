import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRouter } from '@/routes/auth';
import { trucksRouter } from '@/routes/trucks';
import { adminRouter } from '@/routes/admin';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:8081'],
    credentials: true,
  }),
);

app.route('/api/auth', authRouter);
app.route('/api/trucks', trucksRouter);
app.route('/api/admin', adminRouter);

app.get('/api/health', (c) => {
  return c.json({ status: 'ok' });
});

export default app;
