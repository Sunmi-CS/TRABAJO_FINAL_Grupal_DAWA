import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { uploadAvatar as uploadAvatarToStorage } from '../utils/supabaseAvatarStorage';

// GET /api/users (ADMIN only)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', search = '' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error en getUsers:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// GET /api/users/:id
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Un cliente solo puede ver su propio perfil
    if (req.user!.role !== 'ADMIN' && req.user!.id !== id) {
      res.status(403).json({ success: false, message: 'No autorizado' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        provider: true,
        createdAt: true,
        pets: {
          select: { id: true, name: true, species: true, photoUrl: true },
        },
        _count: { select: { reservations: true } },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// PUT /api/users/:id
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Un cliente solo puede actualizar su propio perfil
    if (req.user!.role !== 'ADMIN' && req.user!.id !== id) {
      res.status(403).json({ success: false, message: 'No autorizado' });
      return;
    }

    const { name, password, image } = req.body as {
      name?: string;
      password?: string;
      image?: string;
    };

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (image) updateData.image = image;
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        provider: true,
      },
    });

    res.json({ success: true, message: 'Usuario actualizado exitosamente', data: user });
  } catch (error) {
    console.error('Error en updateUser:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// DELETE /api/users/:id (ADMIN only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { pets: true } } },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    // No se puede eliminar un usuario con mascotas registradas
    if (user._count.pets > 0) {
      res.status(400).json({
        success: false,
        message: `No se puede eliminar este usuario porque tiene ${user._count.pets} mascota(s) registrada(s). Elimina primero sus mascotas.`,
      });
      return;
    }

    await prisma.user.delete({ where: { id } });

    res.json({ success: true, message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// PATCH /api/users/:id/role (ADMIN only)
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body as { role: 'ADMIN' | 'CLIENTE' };

    if (!['ADMIN', 'CLIENTE'].includes(role)) {
      res.status(400).json({ success: false, message: 'Rol inválido. Use ADMIN o CLIENTE.' });
      return;
    }

    // Prevent admin from changing their own role
    if (req.user!.id === id) {
      res.status(400).json({ success: false, message: 'No puedes cambiar tu propio rol' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, image: true, provider: true },
    });

    res.json({ success: true, message: 'Rol actualizado exitosamente', data: updated });
  } catch (error) {
    console.error('Error en updateUserRole:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// POST /api/users/:id/avatar (LOCAL users only)
export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Solo el propio usuario o admin pueden cambiar el avatar
    if (req.user!.role !== 'ADMIN' && req.user!.id !== id) {
      res.status(403).json({ success: false, message: 'No autorizado' });
      return;
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    // Solo usuarios LOCAL pueden cambiar su foto
    if (targetUser.provider !== 'LOCAL') {
      res.status(400).json({
        success: false,
        message: 'Los usuarios registrados con Google no pueden cambiar su foto de perfil.',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No se proporcionó ninguna imagen' });
      return;
    }


    const result = await uploadAvatarToStorage(req.file.buffer, req.file.mimetype, req.file.originalname, id);

    const updated = await prisma.user.update({
      where: { id },
      data: { image: result.url },
      select: { id: true, name: true, email: true, role: true, image: true, provider: true },
    });

    res.json({ success: true, message: 'Foto de perfil actualizada exitosamente', data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor';
    console.error('Error en uploadAvatar:', error);
    res.status(500).json({ success: false, message });
  }
};
