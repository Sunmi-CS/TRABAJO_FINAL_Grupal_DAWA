import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { CreateReservationInput, UpdateReservationStatusInput } from '../schemas/reservation.schema';
import { ReservationStatus } from '@prisma/client';

const reservationIncludes = {
  owner: { select: { id: true, name: true, email: true, image: true } },
  pet: { select: { id: true, name: true, species: true, breed: true, photoUrl: true } },
  service: { select: { id: true, name: true, price: true, duration: true } },
};

// GET /api/reservations
export const getReservations = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }

    const isAdmin = req.user.role === 'ADMIN';
    const { status, page = '1', limit = '10' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = isAdmin ? {} : { ownerId: req.user!.id };
    if (status && Object.values(ReservationStatus).includes(status as ReservationStatus)) {
      where.status = status as ReservationStatus;
    }

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: reservationIncludes,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.reservation.count({ where }),
    ]);

    res.json({
      success: true,
      data: reservations,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error en getReservations:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// GET /api/reservations/:id
export const getReservationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: reservationIncludes,
    });

    if (!reservation) {
      res.status(404).json({ success: false, message: 'Reserva no encontrada' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && reservation.ownerId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'No autorizado' });
      return;
    }

    res.json({ success: true, data: reservation });
  } catch (error) {
    console.error('Error en getReservationById:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// POST /api/reservations
export const createReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reservationDate, reservationTime, petId, serviceId, notes } =
      req.body as CreateReservationInput;

    // Verificar que la mascota pertenece al usuario
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) {
      res.status(404).json({ success: false, message: 'Mascota no encontrada' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && pet.ownerId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'No puedes reservar con una mascota que no es tuya' });
      return;
    }

    // Verificar que el servicio existe y está activo
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      res.status(404).json({ success: false, message: 'Servicio no disponible' });
      return;
    }

    // Verificar que la fecha no es pasada
    const reservationDateTime = new Date(reservationDate);
    if (reservationDateTime < new Date()) {
      res.status(400).json({ success: false, message: 'La fecha de reserva no puede ser en el pasado' });
      return;
    }

    const reservation = await prisma.reservation.create({
      data: {
        reservationDate,
        reservationTime,
        petId,
        serviceId,
        notes,
        ownerId: req.user!.id,
        status: ReservationStatus.PENDING,
      },
      include: reservationIncludes,
    });

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente. Pendiente de aprobación.',
      data: reservation,
    });
  } catch (error) {
    console.error('Error en createReservation:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// PUT /api/reservations/:id (actualizar estado)
export const updateReservationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body as UpdateReservationStatusInput;

    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Reserva no encontrada' });
      return;
    }

    const isAdmin = req.user!.role === 'ADMIN';
    const isOwner = existing.ownerId === req.user!.id;

    // Los clientes solo pueden cancelar sus propias reservas
    if (!isAdmin) {
      if (!isOwner) {
        res.status(403).json({ success: false, message: 'No autorizado' });
        return;
      }
      if (status !== ReservationStatus.CANCELLED) {
        res.status(403).json({ success: false, message: 'Solo puedes cancelar tu reserva' });
        return;
      }
      if (existing.status !== ReservationStatus.PENDING) {
        res.status(400).json({
          success: false,
          message: 'Solo puedes cancelar reservas pendientes',
        });
        return;
      }
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status, ...(notes ? { notes } : {}) },
      include: reservationIncludes,
    });

    res.json({ success: true, message: 'Estado de reserva actualizado', data: reservation });
  } catch (error) {
    console.error('Error en updateReservationStatus:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// DELETE /api/reservations/:id
export const deleteReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Reserva no encontrada' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && existing.ownerId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'No autorizado' });
      return;
    }

    await prisma.reservation.delete({ where: { id } });

    res.json({ success: true, message: 'Reserva eliminada exitosamente' });
  } catch (error) {
    console.error('Error en deleteReservation:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
