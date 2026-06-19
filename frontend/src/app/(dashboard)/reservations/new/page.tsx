'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import api from '@/lib/axios';
import { Pet, Service, ApiResponse } from '@/types';
import { ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';

const createReservationSchema = z.object({
  petId: z.string().min(1, 'Selecciona una mascota'),
  serviceId: z.string().min(1, 'Selecciona un servicio'),
  reservationDate: z.string().min(1, 'La fecha es requerida'),
  reservationTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida'),
  notes: z.string().max(500).optional(),
});

type ReservationForm = z.infer<typeof createReservationSchema>;

export default function NewReservationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultServiceId = searchParams.get('serviceId') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<ReservationForm>({
    resolver: zodResolver(createReservationSchema),
    defaultValues: {
      serviceId: defaultServiceId,
    }
  });

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [petsRes, servicesRes] = await Promise.all([
          api.get<ApiResponse<Pet[]>>('/api/pets'),
          api.get<ApiResponse<Service[]>>('/api/services?active=true'),
        ]);
        setPets(petsRes.data.data);
        setServices(servicesRes.data.data);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Error al cargar la información necesaria para reservar.');
      } finally {
        setDataLoading(false);
      }
    };

    fetchFormData();
  }, []);

  const onSubmit = async (data: ReservationForm) => {
    setIsLoading(true);
    setError('');

    // Validar que la fecha no sea en el pasado
    const selectedDate = new Date(`${data.reservationDate}T${data.reservationTime}`);
    if (selectedDate < new Date()) {
      setError('No puedes realizar reservas en el pasado');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/api/reservations', {
        ...data,
        reservationDate: new Date(data.reservationDate).toISOString(),
      });
      router.push('/reservations');
      router.refresh();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message ?? 'Error al crear la reserva');
    } finally {
      setIsLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  // Obtener fecha de mañana como mínimo
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <>
      <PageHeader 
        title="Nueva Reserva"
        subtitle="Programa un servicio para tu mascota"
        actions={
          <Link href="/dashboard" className="btn-outline bg-white">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        }
      />
      <div className="max-w-2xl">
        {pets.length === 0 ? (
          <div className="card text-center py-12">
            <Info className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-bold text-dark mb-2">Se requiere una mascota</h3>
            <p className="text-dark/60 text-sm mb-6 max-w-sm mx-auto">
              Para realizar una reserva, primero debes tener al menos una mascota registrada en tu perfil.
            </p>
            <Link href="/pets/new" className="btn-secondary">Registrar Mascota</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6 animate-slide-up">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6">
              <Select
                id="res-pet"
                label="Mascota"
                placeholder="Seleccione una mascota"
                options={pets.map(p => ({ value: p.id, label: `${p.name} (${p.species})` }))}
                error={errors.petId?.message}
                {...register('petId')}
              />

              <Select
                id="res-service"
                label="Servicio"
                placeholder="Seleccione un servicio"
                options={services.map(s => ({ value: s.id, label: `${s.name} - $${s.price}` }))}
                error={errors.serviceId?.message}
                {...register('serviceId')}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <Input
                id="res-date"
                type="date"
                label="Fecha"
                min={minDate}
                error={errors.reservationDate?.message}
                {...register('reservationDate')}
              />

              <Input
                id="res-time"
                type="time"
                label="Hora"
                error={errors.reservationTime?.message}
                {...register('reservationTime')}
              />
            </div>

            <Textarea
              id="res-notes"
              label="Indicaciones especiales (opcional)"
              placeholder="¿Hay algo que debamos saber para este servicio?"
              error={errors.notes?.message}
              {...register('notes')}
            />

            <div className="pt-4 border-t border-dark/10 flex justify-end">
              <Button type="submit" size="lg" isLoading={isLoading}>
                Confirmar Reserva
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
