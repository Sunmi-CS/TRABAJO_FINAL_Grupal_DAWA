'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Service, ApiResponse } from '@/types';
import { Clock, DollarSign, CheckCircle2, Info, Plus, Edit2, Trash2, Power } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmModal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para CRUD admin
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: 0, duration: 30, isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      // Admin ve todos, Cliente solo activos
      const url = user?.role === 'ADMIN' ? '/api/services' : '/api/services?active=true';
      const { data } = await api.get<ApiResponse<Service[]>>(url);
      setServices(data.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Solo hacer fetch si sabemos el rol (o si no está autenticado, pero esta ruta es protegida)
    if (user !== undefined) {
      fetchServices();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        isActive: service.isActive
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
      fetchServices();
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
      setIsModalOpen(false);
      fetchServices();
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
      fetchServices();
    } catch (error) {
      alert('Error al cambiar el estado del servicio');
    }
  };

  const headerActions = user?.role === 'ADMIN' ? (
    <button onClick={() => handleOpenModal()} className="btn-primary">
      <Plus className="w-4 h-4" /> Nuevo Servicio
    </button>
  ) : (
    <Link href="/reservations/new" className="btn-primary">
      Reservar Ahora
    </Link>
  );

  return (
    <>
      <PageHeader 
        title="Nuestros Servicios" 
        subtitle="Descubre todos los servicios de cuidado y estética que ofrecemos."
        actions={headerActions}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner w-8 h-8" />
        </div>
      ) : services.length === 0 ? (
        <div className="card text-center py-16">
          <Info className="w-12 h-12 text-dark/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-dark mb-2">No hay servicios disponibles</h3>
          <p className="text-dark/60 text-sm">
            En este momento no hay servicios configurados.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className={`card-hover flex flex-col relative overflow-hidden group ${!service.isActive ? 'opacity-70 grayscale-[30%]' : ''}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110" />
              
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-dark pr-8">{service.name}</h3>
                  <div className="text-primary font-bold text-xl flex items-center shrink-0">
                    <DollarSign className="w-5 h-5 -mr-1" />
                    {service.price.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center text-sm text-dark/50 gap-1.5 font-medium">
                  <Clock className="w-4 h-4" />
                  {service.duration} minutos
                  {!service.isActive && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-md">Inactivo</span>
                  )}
                </div>
              </div>

              <p className="text-dark/70 text-sm leading-relaxed flex-1">
                {service.description}
              </p>

              <div className="mt-6 pt-6 border-t border-dark/10">
                {user?.role !== 'ADMIN' ? (
                  <>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start gap-2 text-sm text-dark/70">
                        <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                        Atención por profesionales
                      </li>
                      <li className="flex items-start gap-2 text-sm text-dark/70">
                        <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                        Productos premium
                      </li>
                    </ul>
                    <Link 
                      href={`/reservations/new?serviceId=${service.id}`} 
                      className="btn-outline w-full group-hover:bg-primary group-hover:text-white transition-colors block text-center"
                    >
                      Agendar este servicio
                    </Link>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(service)}
                      className="flex-1 btn-outline py-2 text-sm"
                    >
                      <Edit2 className="w-4 h-4 mr-2" /> Editar
                    </button>
                    <button 
                      onClick={() => handleToggleActive(service.id, service.isActive)}
                      className={`w-10 flex items-center justify-center rounded-xl border ${service.isActive ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                      title={service.isActive ? "Desactivar" : "Activar"}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteId(service.id)}
                      className="w-10 flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal CRUD Admin */}
      {isModalOpen && user?.role === 'ADMIN' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in shadow-xl">
            <h2 className="text-xl font-bold text-dark mb-4">
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h2>
            <form onSubmit={handleSaveService} className="space-y-4">
              <Input
                id="svc-name"
                label="Nombre del Servicio"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  required
                />
                <Input
                  id="svc-duration"
                  type="number"
                  min="1"
                  label="Duración (min)"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                  required
                />
              </div>
              <Textarea
                id="svc-desc"
                label="Descripción"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="svc-active" 
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="svc-active" className="text-sm font-medium text-dark">Servicio Activo (Visible para clientes)</label>
              </div>

              <div className="flex gap-3 pt-4 mt-2 border-t border-dark/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-outline">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary">
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
