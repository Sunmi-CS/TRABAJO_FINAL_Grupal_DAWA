import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { VaccinationInput } from '../schemas/vaccination.schema';

const canAccessPet = (pet: { ownerId: string }, user: Express.Request['user']) => {
  return user?.role === 'ADMIN' || pet.ownerId === user?.id;
};

const parseDateInput = (value: string) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00.000Z`)
    : new Date(value);
};

const toVaccinationData = (data: VaccinationInput) => ({
  name: data.name,
  applicationDate: parseDateInput(data.applicationDate),
  nextDueDate: data.nextDueDate ? parseDateInput(data.nextDueDate) : null,
  notes: data.notes?.trim() || null,
});

// GET /api/pets/:petId/vaccinations
export const getVaccinationsByPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { petId } = req.params;

    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) {
      res.status(404).json({ success: false, message: 'Mascota no encontrada' });
      return;
    }

    if (!canAccessPet(pet, req.user)) {
      res.status(403).json({ success: false, message: 'No autorizado' });
      return;
    }

    const vaccinations = await prisma.vaccination.findMany({
      where: { petId },
      orderBy: { applicationDate: 'desc' },
    });

    res.json({ success: true, data: vaccinations });
  } catch (error) {
    console.error('Error en getVaccinationsByPet:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// POST /api/pets/:petId/vaccinations
export const createVaccination = async (req: Request, res: Response): Promise<void> => {
  try {
    const { petId } = req.params;
    const data = req.body as VaccinationInput;

    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) {
      res.status(404).json({ success: false, message: 'Mascota no encontrada' });
      return;
    }

    if (!canAccessPet(pet, req.user)) {
      res.status(403).json({ success: false, message: 'No autorizado' });
      return;
    }

    const vaccination = await prisma.vaccination.create({
      data: {
        ...toVaccinationData(data),
        petId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Vacuna registrada exitosamente',
      data: vaccination,
    });
  } catch (error) {
    console.error('Error en createVaccination:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// PUT /api/vaccinations/:vaccinationId
export const updateVaccination = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vaccinationId } = req.params;
    const data = req.body as VaccinationInput;

    const existing = await prisma.vaccination.findUnique({
      where: { id: vaccinationId },
      include: { pet: true },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Vacuna no encontrada' });
      return;
    }

    if (!canAccessPet(existing.pet, req.user)) {
      res.status(403).json({ success: false, message: 'No autorizado' });
      return;
    }

    const vaccination = await prisma.vaccination.update({
      where: { id: vaccinationId },
      data: toVaccinationData(data),
    });

    res.json({ success: true, message: 'Vacuna actualizada exitosamente', data: vaccination });
  } catch (error) {
    console.error('Error en updateVaccination:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// DELETE /api/vaccinations/:vaccinationId
export const deleteVaccination = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vaccinationId } = req.params;

    const existing = await prisma.vaccination.findUnique({
      where: { id: vaccinationId },
      include: { pet: true },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Vacuna no encontrada' });
      return;
    }

    if (!canAccessPet(existing.pet, req.user)) {
      res.status(403).json({ success: false, message: 'No autorizado' });
      return;
    }

    await prisma.vaccination.delete({ where: { id: vaccinationId } });

    res.json({ success: true, message: 'Vacuna eliminada exitosamente' });
  } catch (error) {
    console.error('Error en deleteVaccination:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
