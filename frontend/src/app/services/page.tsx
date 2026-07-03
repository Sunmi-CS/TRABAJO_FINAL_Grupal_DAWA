'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, DollarSign, CheckCircle2, Info, Plus, Edit2, Trash2, Power, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { ApiResponse, Service } from '@/types';
import api from '@/lib/axios';
import { ConfirmModal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';

export default function ServicesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (authLoading) return;

    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const url = isAdmin ? '/api/services' : '/api/services?active=true';
        const { data } = await api.get<ApiResponse<Service[]>>(url);
        setServices(data.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchServices();
  }, [authLoading, isAdmin]);

  const refreshServices = async () => {
    const url = isAdmin ? '/api/services' : '/api/services?active=true';
    const { data } = await api.get<ApiResponse<Service[]>>(url);
    setServices(data.data);
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        isActive: service.isActive,
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', description: '', price: 0, duration: 30, isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingService) {
        await api.put(`/api/services/${editingService.id}`, formData);
      } else {
        await api.post('/api/services', formData);
      }
      setIsModalOpen(false);
      await refreshServices();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar el servicio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/services/${deleteId}`);
      await refreshServices();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar el servicio');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/api/services/${id}`, { isActive: !currentStatus });
      await refreshServices();
    } catch (error) {
      alert('Error al cambiar el estado del servicio');
    }
  };

  const headerActions = isAdmin ? (
    <div className="flex flex-wrap gap-3">
      <Link href="/dashboard" className="btn-outline bg-white">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>
      <button onClick={() => handleOpenModal()} className="btn-primary">
        <Plus className="w-4 h-4" /> Nuevo Servicio
      </button>
    </div>
  ) : isAuthenticated ? (
    <div className="flex flex-wrap gap-3">
      <Link href="/dashboard" className="btn-outline bg-white">
        Mi Panel
      </Link>
      <Link href="/reservations/new" className="btn-primary">
        Reservar Ahora
      </Link>
    </div>
  ) : (
    <div className="flex flex-wrap gap-3">
      <Link href="/login?redirect=%2Fservices" className="btn-outline bg-white">
        Iniciar Sesión
      </Link>
      <Link href="/register?redirect=%2Fservices" className="btn-primary">
        Crear Cuenta
      </Link>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-20 border-b border-dark/10 bg-white/90 backdrop-blur-md">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center text-lg shadow-sm">
                🐾
              </div>
              <div>
                <p className="font-bold text-dark leading-none">PetCare</p>
                <p className="text-xs text-dark/50">Servicios para tu mascota</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard" className="btn-outline bg-white">
                  Ir al panel
                </Link>
              ) : (
                <>
                  <Link href="/login?redirect=%2Fservices" className="text-dark font-medium hover:text-primary transition-colors">
                    Iniciar sesión
                  </Link>
                  <Link href="/register?redirect=%2Fservices" className="btn-primary">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-10">
          <section className="mb-10 rounded-[2rem] border border-primary/10 bg-white p-8 shadow-sm lg:p-12">
            <div className="max-w-3xl">
              <p className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                Guardería, paseo y estética
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-dark lg:text-5xl">
                Servicios pensados para el cuidado diario de tu mascota
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-dark/65 lg:text-lg">
                Consulta nuestros servicios activos, revisa precios y duración, y agenda en línea si ya tienes una cuenta.
              </p>
            </div>
          </section>

          <PageHeader
            title="Nuestros Servicios"
            subtitle="Listado actualizado de servicios disponibles para clientes y administración."
            actions={headerActions}
          />

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="spinner h-8 w-8" />
            </div>
          ) : services.length === 0 ? (
            <div className="card py-16 text-center">
              <Info className="mx-auto mb-4 h-12 w-12 text-dark/30" />
              <h3 className="mb-2 text-lg font-bold text-dark">No hay servicios disponibles</h3>
              <p className="text-sm text-dark/60">
                En este momento no hay servicios configurados.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`card-hover relative flex flex-col overflow-hidden group ${!service.isActive ? 'opacity-70 grayscale-[30%]' : ''}`}
                >
                  <div className="absolute right-0 top-0 -z-10 h-32 w-32 rounded-bl-[100px] bg-primary/5 transition-transform group-hover:scale-110" />

                  <div className="mb-4">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="pr-8 text-xl font-bold text-dark">{service.name}</h3>
                      <div className="flex shrink-0 items-center text-xl font-bold text-primary">
                        <DollarSign className="-mr-1 h-5 w-5" />
                        {service.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-dark/50">
                      <Clock className="h-4 w-4" />
                      {service.duration} minutos
                      {!service.isActive && (
                        <span className="ml-2 rounded-md bg-red-100 px-2 py-0.5 text-xs text-red-700">Inactivo</span>
                      )}
                    </div>
                  </div>

                  <p className="flex-1 text-sm leading-relaxed text-dark/70">
                    {service.description}
                  </p>

                  <div className="mt-6 border-t border-dark/10 pt-6">
                    {!isAdmin ? (
                      <>
                        <ul className="mb-6 space-y-2">
                          <li className="flex items-start gap-2 text-sm text-dark/70">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                            Atención por profesionales
                          </li>
                          <li className="flex items-start gap-2 text-sm text-dark/70">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                            Seguimiento claro del servicio
                          </li>
                        </ul>
                        <Link
                          href={isAuthenticated ? `/reservations/new?serviceId=${service.id}` : '/login?redirect=%2Freservations%2Fnew'}
                          className="btn-outline block w-full text-center transition-colors group-hover:bg-primary group-hover:text-white"
                        >
                          {isAuthenticated ? 'Agendar este servicio' : 'Inicia sesión para reservar'}
                        </Link>
                      </>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(service)}
                          className="btn-outline flex-1 py-2 text-sm"
                        >
                          <Edit2 className="mr-2 h-4 w-4" /> Editar
                        </button>
                        <button
                          onClick={() => handleToggleActive(service.id, service.isActive)}
                          className={`flex w-10 items-center justify-center rounded-xl border ${service.isActive ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                          title={service.isActive ? 'Desactivar' : 'Activar'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(service.id)}
                          className="flex w-10 items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                          title="Eliminar"
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
        </main>
      </div>

      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md animate-fade-in rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-dark">
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h2>
            <form onSubmit={handleSaveService} className="space-y-4">
              <Input
                id="svc-name"
                label="Nombre del Servicio"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="svc-price"
                  type="number"
                  step="0.01"
                  min="0"
                  label="Precio ($)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
                <Input
                  id="svc-duration"
                  type="number"
                  min="1"
                  label="Duración (min)"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  required
                />
              </div>
              <Textarea
                id="svc-desc"
                label="Descripción"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="svc-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded text-primary"
                />
                <label htmlFor="svc-active" className="text-sm font-medium text-dark">
                  Servicio Activo (Visible para clientes)
                </label>
              </div>

              <div className="mt-2 flex gap-3 border-t border-dark/10 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline flex-1">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Servicio"
        message="¿Estás seguro de que deseas eliminar este servicio? Si hay reservas activas asociadas, la acción no se permitirá. Considera desactivarlo en su lugar."
        confirmLabel="Eliminar"
        isDestructive
        isLoading={isDeleting}
      />
    </>
  );
}
