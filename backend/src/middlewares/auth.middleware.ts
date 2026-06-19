import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Extender el tipo Request de Express para incluir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: string;
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Token de autenticación requerido' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole('ADMIN');
export const requireAdminOrOwner = (getOwnerId: (req: Request) => string | undefined) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }

    if (req.user.role === 'ADMIN') {
      next();
      return;
    }

    const ownerId = getOwnerId(req);
    if (ownerId && ownerId === req.user.id) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: 'No tienes permisos para acceder a este recurso',
    });
  };
};
