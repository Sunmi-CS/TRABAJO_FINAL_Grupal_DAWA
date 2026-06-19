import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { CreateServiceInput, UpdateServiceInput } from '../schemas/service.schema';

// GET /api/services
export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { active } = req.query;
    const where = active === 'true' ? { isActive: true } : {};

    const services = await prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { reservations: true } },
      },
    });

    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Error en getServices:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// GET /api/services/:id
export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        _count: { select: { reservations: true } },
      },
    });

    if (!service) {
      res.status(404).json({ success: false, message: 'Servicio no encontrado' });
      return;
    }

    res.json({ success: true, data: service });
  } catch (error) {
    console.error('Error en getServiceById:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// POST /api/services (ADMIN only)
export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body as CreateServiceInput;

    const service = await prisma.service.create({ data });

    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      data: service,
    });
  } catch (error) {
    console.error('Error en createService:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// PUT /api/services/:id (ADMIN only)
export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateServiceInput;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Servicio no encontrado' });
      return;
    }

    const service = await prisma.service.update({ where: { id }, data });

    res.json({ success: true, message: 'Servicio actualizado exitosamente', data: service });
  } catch (error) {
    console.error('Error en updateService:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// DELETE /api/services/:id (ADMIN only)
export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Servicio no encontrado' });
      return;
    }

    // Verificar si hay reservas activas
    const activeReservations = await prisma.reservation.count({
      where: {
        serviceId: id,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (activeReservations > 0) {
      res.status(400).json({
        success: false,
        message: 'No se puede eliminar un servicio con reservas activas. Desactívelo en su lugar.',
      });
      return;
    }

    await prisma.service.delete({ where: { id } });

    res.json({ success: true, message: 'Servicio eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteService:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
