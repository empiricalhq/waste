import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { ZodError } from 'zod';
import { authRouter } from '@/routes/auth.ts';
import { adminRouter } from '@/routes/admin.ts';
import { driverRouter } from '@/routes/driver.ts';
import { citizenRouter } from '@/routes/citizen.ts';
import * as z from 'zod';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:8081'],
    credentials: true,
  }),
);

app.use('*', secureHeaders());

app.route('/api/auth', authRouter);
app.route('/api/admin', adminRouter);
app.route('/api/driver', driverRouter);
app.route('/api/citizen', citizenRouter);

app.get('/api/health', (c) =>
  c.json({
    status: 'ok',
    timestamp: Date.now(),
  }),
);

app.onError((err, c) => {
  if (err instanceof z.ZodError) {
    const { formErrors, fieldErrors } = z.flattenError(err);

    return c.json(
      {
        error: 'Validation failed',
        formErrors,
        fieldErrors,
      },
      400,
    );
  }

  console.error(`[API Error] ${err.message}`, err.stack);
  return c.json({ error: 'Internal server error' }, 500);
});

app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

export default app;
