'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Pet, ApiResponse } from '@/types';
import api from '@/lib/axios';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { ConfirmModal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';

export default function PetsPage() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPets = async () => {
    try {
      const { data } = await api.get<ApiResponse<Pet[]>>('/api/pets');
      setPets(data.data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/pets/${deleteId}`);
      setPets(pets.filter(p => p.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting pet:', error);
      alert('Error al eliminar la mascota');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPets = pets.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.breed && p.breed.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <PageHeader 
        title="Mis Mascotas"
        subtitle="Gestiona la información de tus mascotas"
        actions={
          user?.role !== 'ADMIN' ? (
            <Link href="/pets/new" className="btn-primary">
              <Plus className="w-4 h-4" /> Agregar Mascota
            </Link>
          ) : null
        }
      />
      <div className="mb-6 relative max-w-md">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          placeholder="Buscar mascota por nombre, especie o raza..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner w-8 h-8" />
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-dark/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-dark/40">🐾</span>
          </div>
          <h3 className="text-lg font-bold text-dark mb-2">No se encontraron mascotas</h3>
          <p className="text-dark/60 text-sm mb-6 max-w-md mx-auto">
            {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Aún no has registrado ninguna mascota. ¡Agrega tu primera mascota ahora!'}
          </p>
          {!searchTerm && (
            <Link href="/pets/new" className="btn-primary">Registrar Mascota</Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPets.map(pet => (
            <div key={pet.id} className="card-hover group flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {user?.role !== 'ADMIN' && (
                  <Link href={`/pets/${pet.id}/edit`} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-dark/70 hover:text-primary transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </Link>
                )}
                <button 
                  onClick={(e) => { e.preventDefault(); setDeleteId(pet.id); }}
                  className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-dark/70 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <Link href={`/pets/${pet.id}`} className="flex-1 flex flex-col">
                <div className="relative w-full aspect-square bg-dark/5 rounded-xl overflow-hidden mb-4">
                  {pet.photoUrl ? (
                    <Image src={pet.photoUrl} alt={pet.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-20 transition-transform duration-500 group-hover:scale-110">
                      🐾
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-dark truncate">{pet.name}</h3>
                <div className="text-sm text-dark/60 flex items-center gap-2 mt-1 mb-3">
                  <span>{pet.species}</span>
                  {pet.breed && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-dark/20" />
                      <span className="truncate">{pet.breed}</span>
                    </>
                  )}
                </div>
                
                <div className="mt-auto pt-4 border-t border-dark/5 flex justify-between text-sm">
                  <div className="text-center">
                    <p className="text-dark/40 text-xs uppercase font-medium">Edad</p>
                    <p className="font-semibold text-dark">{pet.age} {pet.age === 1 ? 'año' : 'años'}</p>
                  </div>
                  <div className="w-px h-8 bg-dark/10" />
                  <div className="text-center">
                    <p className="text-dark/40 text-xs uppercase font-medium">Peso</p>
                    <p className="font-semibold text-dark">{pet.weight} kg</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Mascota"
        message="¿Estás seguro de que deseas eliminar esta mascota? Esta acción no se puede deshacer y eliminará también todas sus reservas asociadas."
        confirmLabel="Eliminar"
        isDestructive
        isLoading={isDeleting}
      />
    </>
  );
}
