'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarDays,
  Edit2,
  Info,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmModal, Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Vaccination, VaccinationForm } from '@/types';
import {
  createVaccination,
  deleteVaccination,
  isVaccinationApiUnavailable,
  listVaccinationsByPet,
  updateVaccination,
  VaccinationPayload,
} from '@/lib/vaccinations';

const vaccinationSchema = z.object({
  name: z.string().min(2, 'Ingresa el nombre de la vacuna'),
  applicationDate: z.string().min(1, 'Ingresa la fecha de aplicación'),
  nextDueDate: z.string().optional(),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
}).refine((data) => {
  if (!data.nextDueDate) return true;
  return data.nextDueDate >= data.applicationDate;
}, {
  message: 'La próxima dosis no puede ser anterior a la aplicación',
  path: ['nextDueDate'],
});

type VaccinationSectionProps = {
  petId: string;
  petName: string;
  canManage?: boolean;
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Sin fecha';

  return new Date(value).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const toFormValues = (vaccination?: Vaccination): VaccinationForm => ({
  name: vaccination?.name ?? '',
  applicationDate: vaccination?.applicationDate ? new Date(vaccination.applicationDate).toISOString().split('T')[0] : '',
  nextDueDate: vaccination?.nextDueDate ? new Date(vaccination.nextDueDate).toISOString().split('T')[0] : '',
  notes: vaccination?.notes ?? '',
});

export function VaccinationSection({ petId, petName, canManage = false }: VaccinationSectionProps) {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [integrationPending, setIntegrationPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Vaccination | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VaccinationForm>({
    resolver: zodResolver(vaccinationSchema),
    defaultValues: toFormValues(),
  });

  const sortedVaccinations = useMemo(
    () => [...vaccinations].sort(
      (a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime(),
    ),
    [vaccinations],
  );

  const fetchVaccinations = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const data = await listVaccinationsByPet(petId);
      setVaccinations(data);
      setIntegrationPending(false);
    } catch (error) {
      if (isVaccinationApiUnavailable(error)) {
        setVaccinations([]);
        setIntegrationPending(true);
        setErrorMsg('');
      } else {
        const candidate = error as { response?: { data?: { message?: string } } };
        setErrorMsg(candidate.response?.data?.message || 'No se pudo cargar el historial de vacunas.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchVaccinations();
  }, [petId]);

  const handleOpenCreate = () => {
    setEditingVaccination(null);
    reset(toFormValues());
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vaccination: Vaccination) => {
    setEditingVaccination(vaccination);
    reset(toFormValues(vaccination));
    setIsModalOpen(true);
  };

  const onSubmit = async (values: VaccinationForm) => {
    const payload: VaccinationPayload = {
      name: values.name,
      applicationDate: values.applicationDate,
      nextDueDate: values.nextDueDate || null,
      notes: values.notes?.trim() || '',
    };

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (editingVaccination) {
        await updateVaccination(editingVaccination.id, payload);
      } else {
        await createVaccination(petId, payload);
      }

      setIsModalOpen(false);
      setEditingVaccination(null);
      reset(toFormValues());
      await fetchVaccinations();
    } catch (error) {
      const candidate = error as { response?: { data?: { message?: string } } };
      setErrorMsg(candidate.response?.data?.message || 'No se pudo guardar la vacuna.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setErrorMsg('');

    try {
      await deleteVaccination(deleteTarget.id);
      setDeleteTarget(null);
      await fetchVaccinations();
    } catch (error) {
      const candidate = error as { response?: { data?: { message?: string } } };
      setErrorMsg(candidate.response?.data?.message || 'No se pudo eliminar la vacuna.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="card">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-dark">
              <ShieldCheck className="h-5 w-5 text-secondary" />
              Historial de Vacunas
            </h2>
            <p className="mt-1 text-sm text-dark/60">
              Controla las aplicaciones y próximas dosis de {petName}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" onClick={() => void fetchVaccinations()} leftIcon={<RefreshCcw className="h-4 w-4" />}>
              Actualizar
            </Button>
            {canManage && (
              <Button onClick={handleOpenCreate} leftIcon={<Plus className="h-4 w-4" />} disabled={integrationPending || isLoading}>
                Registrar Vacuna
              </Button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {integrationPending ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div className="space-y-3 text-sm text-amber-900">
                <div>
                  <p className="font-semibold">UI de vacunas lista para conectar</p>
                  <p className="mt-1 text-amber-800/90">
                    El frontend ya está preparado. Falta que backend implemente los endpoints acordados.
                  </p>
                </div>
                <div className="rounded-xl bg-white/80 p-3 font-mono text-xs leading-6 text-amber-900">
                  GET /api/pets/:petId/vaccinations
                  <br />
                  POST /api/pets/:petId/vaccinations
                  <br />
                  PUT /api/vaccinations/:vaccinationId
                  <br />
                  DELETE /api/vaccinations/:vaccinationId
                </div>
                <p className="text-xs text-amber-800/90">
                  Respuesta esperada: <span className="font-mono">ApiResponse&lt;Vaccination[]&gt;</span> y <span className="font-mono">ApiResponse&lt;Vaccination&gt;</span>.
                </p>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex h-36 items-center justify-center">
            <div className="spinner h-8 w-8" />
          </div>
        ) : sortedVaccinations.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-dark/10 py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-dark/5">
              <ShieldCheck className="h-7 w-7 text-dark/30" />
            </div>
            <h3 className="text-lg font-bold text-dark">Aún no hay vacunas registradas</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-dark/60">
              Registra la primera vacuna para comenzar el historial sanitario de {petName}.
            </p>
            {canManage && (
              <div className="mt-6">
                <Button onClick={handleOpenCreate} leftIcon={<Plus className="h-4 w-4" />}>
                  Registrar primera vacuna
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedVaccinations.map((vaccination) => (
              <div
                key={vaccination.id}
                className="rounded-2xl border border-dark/10 bg-white p-4 shadow-sm transition-colors hover:border-secondary/30"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-dark">{vaccination.name}</h3>
                      <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
                        Aplicada {formatDate(vaccination.applicationDate)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-dark/65">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-dark/40" />
                        Próxima dosis: {vaccination.nextDueDate ? formatDate(vaccination.nextDueDate) : 'Sin programar'}
                      </span>
                    </div>

                    {vaccination.notes && (
                      <p className="rounded-xl bg-dark/5 p-3 text-sm leading-relaxed text-dark/75">
                        {vaccination.notes}
                      </p>
                    )}
                  </div>

                  {canManage && (
                    <div className="flex gap-2 sm:justify-end">
                      <button
                        onClick={() => handleOpenEdit(vaccination)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-dark/10 text-dark/50 transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                        title="Editar vacuna"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(vaccination)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-500 transition-colors hover:bg-red-50"
                        title="Eliminar vacuna"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVaccination(null);
          reset(toFormValues());
        }}
        title={editingVaccination ? 'Editar vacuna' : 'Registrar vacuna'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              id="vac-name"
              label="Nombre de la vacuna"
              placeholder="Ej. Séxtuple"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              id="vac-application-date"
              type="date"
              label="Fecha de aplicación"
              error={errors.applicationDate?.message}
              {...register('applicationDate')}
            />
          </div>

          <Input
            id="vac-next-date"
            type="date"
            label="Próxima dosis (opcional)"
            error={errors.nextDueDate?.message}
            {...register('nextDueDate')}
          />

          <Textarea
            id="vac-notes"
            label="Observaciones"
            placeholder="Lote, veterinario, reacciones o notas de control..."
            error={errors.notes?.message}
            {...register('notes')}
          />

          <div className="flex justify-end gap-3 border-t border-dark/10 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingVaccination(null);
                reset(toFormValues());
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingVaccination ? 'Guardar cambios' : 'Registrar vacuna'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar vacuna"
        message={`¿Deseas eliminar ${deleteTarget?.name ?? 'esta vacuna'} del historial de ${petName}?`}
        confirmLabel="Eliminar"
        isDestructive
        isLoading={isDeleting}
      />
    </>
  );
}
