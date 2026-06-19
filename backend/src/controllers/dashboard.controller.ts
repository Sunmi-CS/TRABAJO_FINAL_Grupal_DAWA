import { Request, Response } from 'express';
import prisma from '../config/prisma';

// GET /api/dashboard (ADMIN only)
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalPets,
      totalReservations,
      reservationsByStatus,
      topServices,
      recentReservations,
      newUsersThisMonth,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CLIENTE' } }),
      prisma.pet.count(),
      prisma.reservation.count(),

      // Reservas por estado
      prisma.reservation.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      // Top 5 servicios más solicitados
      prisma.reservation.groupBy({
        by: ['serviceId'],
        _count: { serviceId: true },
        orderBy: { _count: { serviceId: 'desc' } },
        take: 5,
      }),

      // Últimas 5 reservas
      prisma.reservation.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { name: true, image: true } },
          pet: { select: { name: true, species: true } },
          service: { select: { name: true, price: true } },
        },
      }),

      // Nuevos usuarios este mes
      prisma.user.count({
        where: {
          role: 'CLIENTE',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    // Enriquecer top servicios con nombres
    const serviceIds = topServices.map((s) => s.serviceId);
    const servicesData = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true, price: true },
    });

    const topServicesEnriched = topServices.map((s) => ({
      service: servicesData.find((sd) => sd.id === s.serviceId),
      count: s._count.serviceId,
    }));

    // Formatear reservas por estado
    const statusMap = reservationsByStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>,
    );

    const allStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'];
    const reservationsByStatusFormatted = allStatuses.map((status) => ({
      status,
      count: statusMap[status] ?? 0,
    }));

    res.json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          pets: totalPets,
          reservations: totalReservations,
          newUsersThisMonth,
        },
        reservationsByStatus: reservationsByStatusFormatted,
        topServices: topServicesEnriched,
        recentReservations,
      },
    });
  } catch (error) {
    console.error('Error en getDashboardStats:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
