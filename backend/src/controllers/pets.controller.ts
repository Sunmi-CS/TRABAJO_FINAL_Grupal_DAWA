import { Request, Response } from 'express';
import prisma from '../config/prisma';
import {
  uploadPetImage,
  updatePetImage,
  deletePetImage,
  extractPathFromUrl,
} from '../utils/supabaseStorage';
import { CreatePetInput, UpdatePetInput } from '../schemas/pet.schema';

// GET /api/pets
export const getPets = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }

    const isAdmin = req.user.role === 'ADMIN';
    const where = isAdmin ? {} : { ownerId: req.user!.id };

    const pets = await prisma.pet.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { reservations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: pets });
  } catch (error) {
    console.error('Error en getPets:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// GET /api/pets/:id
export const getPetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const pet = await prisma.pet.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        reservations: {
          include: {
            service: { select: { id: true, name: true, price: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!pet) {
      res.status(404).json({ success: false, message: 'Mascota no encontrada' });
      return;
    }

    // Clientes solo pueden ver sus propias mascotas
    if (req.user!.role !== 'ADMIN' && pet.ownerId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'No autorizado' });
      return;
    }

    res.json({ success: true, data: pet });
  } catch (error) {
    console.error('Error en getPetById:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// POST /api/pets
export const createPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body as CreatePetInput;
    let photoUrl: string | undefined;

    // Subir foto si viene en la solicitud
    if (req.file) {
      const result = await uploadPetImage(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname,
      );
      photoUrl = result.url;
    }

    const pet = await prisma.pet.create({
      data: {
        ...data,
        photoUrl,
        ownerId: req.user!.id,
      },
    });

    res.status(201).json({ success: true, message: 'Mascota registrada exitosamente', data: pet });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor';
    console.error('Error en createPet:', error);
    res.status(500).json({ success: false, message });
  }
};

// PUT /api/pets/:id
export const updatePet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as UpdatePetInput;

    const existing = await prisma.pet.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Mascota no encontrada' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && existing.ownerId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'No autorizado' });
      return;
    }

    let photoUrl = existing.photoUrl;

    // Actualizar foto si viene nueva
    if (req.file) {
      const oldPath = existing.photoUrl ? extractPathFromUrl(existing.photoUrl) : null;
      const result = await updatePetImage(
        oldPath,
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname,
      );
      photoUrl = result.url;
    }

    const pet = await prisma.pet.update({
      where: { id },
      data: { ...data, photoUrl },
    });

    res.json({ success: true, message: 'Mascota actualizada exitosamente', data: pet });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor';
    console.error('Error en updatePet:', error);
    res.status(500).json({ success: false, message });
  }
};

// DELETE /api/pets/:id
export const deletePet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.pet.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Mascota no encontrada' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && existing.ownerId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'No autorizado' });
      return;
    }

    // Eliminar imagen de Supabase Storage si existe
    if (existing.photoUrl) {
      const filePath = extractPathFromUrl(existing.photoUrl);
      if (filePath) {
        await deletePetImage(filePath);
      }
    }

    await prisma.pet.delete({ where: { id } });

    res.json({ success: true, message: 'Mascota eliminada exitosamente' });
  } catch (error) {
    console.error('Error en deletePet:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
