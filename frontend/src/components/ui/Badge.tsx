'use client';

import { ReservationStatus } from '@/types';

const statusConfig: Record<ReservationStatus, { label: string; className: string; dot: string }> = {
  PENDING: { label: 'Pendiente', className: 'badge-pending', dot: 'bg-amber-500' },
  APPROVED: { label: 'Aprobada', className: 'badge-approved', dot: 'bg-secondary' },
  REJECTED: { label: 'Rechazada', className: 'badge-rejected', dot: 'bg-red-500' },
  COMPLETED: { label: 'Completada', className: 'badge-completed', dot: 'bg-primary' },
  CANCELLED: { label: 'Cancelada', className: 'badge-cancelled', dot: 'bg-dark/30' },
};

interface StatusBadgeProps {
  status: ReservationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.PENDING;
  return (
    <span className={config.className}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

interface RoleBadgeProps {
  role: 'ADMIN' | 'CLIENTE';
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        role === 'ADMIN'
          ? 'bg-primary/15 text-primary-700'
          : 'bg-dark/10 text-dark/60'
      }`}
    >
      {role}
    </span>
  );
}
