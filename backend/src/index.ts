import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import petsRoutes from './routes/pets.routes';
import servicesRoutes from './routes/services.routes';
import reservationsRoutes from './routes/reservations.routes';
import dashboardRoutes from './routes/dashboard.routes';
import vaccinationsRoutes from './routes/vaccinations.routes';

const app = express();
const PORT = process.env.PORT ?? 4000;

// ── Middlewares globales ──────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:3000',
      'https://*.onrender.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'PetCare API',
    version: '1.0.0',
  });
});

// ── Rutas API ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vaccinations', vaccinationsRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Error no manejado:', err);

  // Errores de Multer
  if (err.message.includes('Formato no permitido') || err.message.includes('File too large')) {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
  });
});

// ── Iniciar servidor ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🐾 PetCare API corriendo en http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV ?? 'development'}\n`);
});

export default app;
