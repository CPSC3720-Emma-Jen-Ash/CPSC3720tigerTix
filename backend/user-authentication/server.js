import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

// Lightweight health endpoint for quick connectivity checks
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'user-authentication' });
});

// Global error handlers to surface uncaught errors during startup/runtime
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
  // keep process alive long enough for logs to flush in dev
  setTimeout(() => process.exit(1), 100);
});

if (process.env.NODE_ENV !== 'test') {
  console.log('Starting User-authentication service... (NODE_ENV=' + (process.env.NODE_ENV || '') + ')');
  // Bind explicitly to 0.0.0.0 to avoid IPv6/localhost binding oddities on some Windows systems
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`User-authentication service running on http://localhost:${PORT} (bound to 0.0.0.0)`);
  });

  server.on('error', (err) => {
    console.error('Server listen error:', err && err.stack ? err.stack : err);
  });

}

export default app;
