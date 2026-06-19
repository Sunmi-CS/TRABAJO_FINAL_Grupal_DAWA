'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import { Pet, Reservation, PaginatedResponse, ApiResponse } from '@/types';
import { PawPrint, Calendar as CalendarIcon, Plus, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import Image from 'next/image';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const petsRes = await api.get('/api/pets');
        console.log('Pets OK:', petsRes.data);

        const resRes = await api.get('/api/reservations?limit=5');
        console.log('Reservations OK:', resRes.data);

        setPets(petsRes.data.data.slice(0, 3));
        setRecentReservations(resRes.data.data);
      } catch (error: any) {
        console.error('ERROR STATUS:', error.response?.status);
        console.error('ERROR DATA:', error.response?.data);
        console.error('ERROR COMPLETO:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Hola, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Bienvenido a tu panel de control de PetCare</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Mis Mascotas Resumen */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-primary" />
              Mis Mascotas
            </h2>
            <Link href="/pets/new" className="btn-ghost text-primary hover:bg-primary/10">
              <Plus className="w-4 h-4" /> Agregar
            </Link>
          </div>

          {pets.length === 0 ? (
            <div className="text-center py-8 bg-dark/2 rounded-xl border border-dashed border-dark/20">
              <div className="w-12 h-12 bg-dark/5 rounded-full flex items-center justify-center mx-auto mb-3">
                <PawPrint className="w-6 h-6 text-dark/40" />
              </div>
              <p className="text-dark/60 text-sm mb-4">Aún no has registrado ninguna mascota</p>
              <Link href="/pets/new" className="btn-primary">Registrar Mascota</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {pets.map((pet) => (
                <div key={pet.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark/2 transition-colors border border-transparent hover:border-dark/5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary/10">
                    {pet.photoUrl ? (
                      <Image src={pet.photoUrl} alt={pet.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                        {pet.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-dark truncate">{pet.name}</p>
                    <p className="text-xs text-dark/60 truncate">{pet.species} • {pet.age} años</p>
                  </div>
                  <Link href={`/pets/${pet.id}`} className="p-2 rounded-lg text-dark/40 hover:text-primary hover:bg-primary/10 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              ))}
              {pets.length >= 3 && (
                <Link href="/pets" className="block text-center text-sm text-primary font-medium hover:underline py-2">
                  Ver todas mis mascotas
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Mis Reservas Recientes */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-secondary" />
              {user?.role === 'ADMIN' ? 'Reservas Recientes' : 'Mis Reservas Recientes'}
            </h2>
            {user?.role === 'ADMIN' ? (
              <Link href="/reservations" className="btn-ghost text-secondary hover:bg-secondary/10">
                Gestionar
              </Link>
            ) : (
              <Link href="/reservations/new" className="btn-ghost text-secondary hover:bg-secondary/10">
                <Plus className="w-4 h-4" /> Nueva
              </Link>
            )}
          </div>

          {recentReservations.length === 0 ? (
            <div className="text-center py-8 bg-dark/2 rounded-xl border border-dashed border-dark/20">
              <div className="w-12 h-12 bg-dark/5 rounded-full flex items-center justify-center mx-auto mb-3">
                <CalendarIcon className="w-6 h-6 text-dark/40" />
              </div>
              <p className="text-dark/60 text-sm mb-4">No tienes reservas activas</p>
              {user?.role !== 'ADMIN' && (
                <Link href="/reservations/new" className="btn-secondary">Hacer una reserva</Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentReservations.map((res) => {
                const date = new Date(res.reservationDate).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'short'
                });
                return (
                  <div key={res.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-dark/5 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-dark">{res.service?.name}</span>
                        <span className="text-xs text-dark/40 px-2 py-0.5 bg-dark/5 rounded-md">
                          {date} • {res.reservationTime}
                        </span>
                      </div>
                      <p className="text-sm text-dark/60 flex items-center gap-1.5">
                        <PawPrint className="w-3.5 h-3.5" /> {res.pet?.name}
                      </p>
                    </div>
                    <div>
                      <StatusBadge status={res.status} />
                    </div>
                  </div>
                );
              })}
              <Link href="/reservations" className="block text-center text-sm text-secondary font-medium hover:underline py-2">
                {user?.role === 'ADMIN' ? 'Ver más Reservas' : 'Ver todo mi historial'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
