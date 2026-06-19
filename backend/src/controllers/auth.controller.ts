import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/prisma';
import { signToken } from '../utils/jwt';
import { RegisterInput, LoginInput, GoogleAuthInput } from '../schemas/auth.schema';
import { Provider, Role } from '@prisma/client';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body as RegisterInput;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'El email ya está registrado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        provider: Provider.LOCAL,
        role: Role.CLIENTE,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          provider: user.provider,
        },
      },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.provider !== Provider.LOCAL || !user.password) {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      return;
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          provider: user.provider,
        },
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// POST /api/auth/google
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body as GoogleAuthInput;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ success: false, message: 'Token de Google inválido' });
      return;
    }

    const { email, name = 'Usuario Google', picture } = payload;

    // Upsert: buscar o crear usuario
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        image: picture ?? undefined,
      },
      create: {
        name,
        email,
        provider: Provider.GOOGLE,
        role: Role.CLIENTE,
        image: picture ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      success: true,
      message: 'Autenticación con Google exitosa',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          provider: user.provider,
        },
      },
    });
  } catch (error) {
    console.error('Error en Google Auth:', error);
    res.status(500).json({ success: false, message: 'Error al autenticar con Google' });
  }
};

// GET /api/auth/me
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        provider: true,
        createdAt: true,
        _count: { select: { pets: true, reservations: true } },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
