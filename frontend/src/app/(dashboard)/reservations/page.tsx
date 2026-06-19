'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Reservation, PaginatedResponse } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { Calendar, Clock, PawPrint, DollarSign, Plus, Search, Filter, X, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { Select } from '@/components/ui/Input';

export default function ReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewingReservation, setViewingReservation] = useState<Reservation | null>(null);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<PaginatedResponse<Reservation>>('/api/reservations?limit=100');
      setReservations(res.data.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.put(`/api/reservations/${id}`, { status: newStatus });
      fetchReservations();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      handleStatusChange(id, 'CANCELLED');
    }
  };

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch = 
      res.pet?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.owner?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.service?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? res.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const headerActions = user?.role !== 'ADMIN' ? (
    <Link href="/reservations/new" className="btn-primary">
      <Plus className="w-4 h-4" /> Nueva Reserva
    </Link>
  ) : null;

  return (
    <>
      <PageHeader 
        title="Gestión de Reservas" 
        subtitle={user?.role === 'ADMIN' ? 'Administra todas las reservas del sistema' : 'Historial de tus servicios programados'}
        actions={headerActions}
      />

      <div className="card space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark/40" />
            <input 
              type="text" 
              placeholder="Buscar por cliente, mascota o servicio..." 
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/40 hover:text-dark">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="w-full sm:w-48 relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark/40 z-10" />
            <select 
              className="input pl-9 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="PENDING">Pendientes</option>
              <option value="APPROVED">Aprobadas</option>
              <option value="COMPLETED">Completadas</option>
              <option value="REJECTED">Rechazadas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner w-8 h-8" />
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-dark/10 rounded-2xl">
            <div className="w-16 h-16 bg-dark/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-dark/30" />
            </div>
            <h3 className="text-lg font-bold text-dark mb-2">No se encontraron reservas</h3>
            <p className="text-dark/60 text-sm mb-6 max-w-sm mx-auto">
              Intenta cambiar los filtros de búsqueda o programa un nuevo servicio.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Detalles de Reserva</th>
                  <th>Mascota</th>
                  <th>Fecha y Hora</th>
                  <th>Estado</th>
                  {user?.role === 'ADMIN' && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((res) => {
                  const date = new Date(res.reservationDate).toLocaleDateString('es-ES', {
                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                  });
                  return (
                    <tr key={res.id}>
                      <td>
                        <div>
                          <p className="font-semibold text-dark">{res.service?.name}</p>
                          {user?.role === 'ADMIN' && (
                            <p className="text-xs text-dark/50 mt-0.5">Cliente: <span className="font-medium text-dark/80">{res.owner?.name}</span></p>
                          )}
                          <p className="text-sm text-dark/60 flex items-center gap-1 mt-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            {res.service?.price.toFixed(2)}
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-primary shrink-0 border border-dark/5 shadow-sm">
                            {res.pet?.photoUrl ? (
                              <Image src={res.pet.photoUrl} alt={res.pet.name} fill className="object-cover" />
                            ) : (
                              <PawPrint className="w-5 h-5 opacity-60" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-dark">{res.pet?.name}</p>
                            <p className="text-xs text-dark/50">{res.pet?.species}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-dark capitalize flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-dark/40" />
                            {date}
                          </p>
                          <p className="text-sm text-dark/60 flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-dark/40" />
                            {res.reservationTime}
                          </p>
                        </div>
                      </td>
                      <td>
                        {user?.role === 'ADMIN' ? (
                          <select 
                            className="input py-1.5 pl-3 pr-8 text-xs font-semibold rounded-lg bg-white hover:bg-dark/2 border border-dark/20 focus:border-primary w-full"
                            value={res.status}
                            onChange={(e) => handleStatusChange(res.id, e.target.value)}
                          >
                            <option value="PENDING">PENDIENTE</option>
                            <option value="APPROVED">APROBADA</option>
                            <option value="COMPLETED">COMPLETADA</option>
                            <option value="REJECTED">RECHAZADA</option>
                            <option value="CANCELLED">CANCELADA</option>
                          </select>
                        ) : (
                          <div className="flex flex-col gap-2 items-start">
                            <StatusBadge status={res.status} />
                            {res.status === 'PENDING' && (
                              <button 
                                onClick={() => handleCancel(res.id)}
                                className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium"
                              >
                                Cancelar reserva
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      {user?.role === 'ADMIN' && (
                        <td>
                          <button 
                            onClick={() => setViewingReservation(res)}
                            className="p-2 text-dark/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Resumen de Reserva */}
      {viewingReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in shadow-xl relative">
            <button 
              onClick={() => setViewingReservation(null)}
              className="absolute top-4 right-4 text-dark/40 hover:text-dark"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-dark mb-6 pr-8">Detalles de la Reserva</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-dark/2 p-3 rounded-xl border border-dark/5">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {viewingReservation.pet?.photoUrl ? (
                    <Image src={viewingReservation.pet.photoUrl} alt={viewingReservation.pet.name} fill className="object-cover" />
                  ) : (
                    <PawPrint className="w-6 h-6 opacity-60" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-dark">{viewingReservation.pet?.name}</p>
                  <p className="text-xs text-dark/60">{viewingReservation.pet?.species} • Dueño: {viewingReservation.owner?.name}</p>
                </div>
              </div>

              <div className="bg-dark/2 p-4 rounded-xl border border-dark/5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-dark/40 font-semibold uppercase">Servicio</p>
                    <p className="font-medium text-dark">{viewingReservation.service?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-dark/40 font-semibold uppercase">Precio</p>
                    <p className="font-bold text-primary">${viewingReservation.service?.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-dark/5 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-dark/40 font-semibold uppercase">Fecha y Hora</p>
                    <p className="font-medium text-dark">
                      {new Date(viewingReservation.reservationDate).toLocaleDateString('es-ES')} • {viewingReservation.reservationTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-dark/40 font-semibold uppercase mb-1">Estado</p>
                    <StatusBadge status={viewingReservation.status} />
                  </div>
                </div>

                {viewingReservation.notes && (
                  <div className="pt-3 border-t border-dark/5">
                    <p className="text-xs text-dark/40 font-semibold uppercase mb-1">Notas / Observaciones</p>
                    <p className="text-sm text-dark/80 bg-white p-2 rounded-lg border border-dark/10">
                      {viewingReservation.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button 
                onClick={() => setViewingReservation(null)}
                className="w-full btn-primary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
