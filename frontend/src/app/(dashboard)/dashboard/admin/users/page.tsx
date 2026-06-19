'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PaginatedResponse, User } from '@/types';
import { Search, Trash2, Shield, User as UserIcon, X } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/axios';

// Extendemos el tipo User para incluir _count que viene de la API
interface UserWithCounts extends User {
  _count?: {
    pets: number;
    reservations: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await api.get<PaginatedResponse<UserWithCounts>>(`/api/users?search=${searchTerm}&limit=100`);
      setUsers(res.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMsg('Error al cargar la lista de usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await api.patch(`/api/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Error al actualizar el rol');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario de forma permanente?')) {
      try {
        await api.delete(`/api/users/${id}`);
        fetchUsers();
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        alert(axiosError.response?.data?.message || 'Error al eliminar el usuario');
      }
    }
  };

  return (
    <>
      <PageHeader 
        title="Gestión de Usuarios" 
        subtitle="Administra los roles y cuentas de los clientes"
      />

      <div className="card space-y-6 animate-fade-in">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark/40" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo electrónico..." 
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner w-8 h-8" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-dark/10 rounded-2xl">
            <div className="w-16 h-16 bg-dark/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-dark/30" />
            </div>
            <h3 className="text-lg font-bold text-dark mb-2">No se encontraron usuarios</h3>
            <p className="text-dark/60 text-sm mb-6 max-w-sm mx-auto">
              Intenta cambiar los términos de búsqueda.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Contacto</th>
                  <th>Estadísticas</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-dark/5">
                          {u.image ? (
                            <Image src={u.image} alt={u.name} fill className="object-cover" />
                          ) : (
                            <span className="font-bold">{u.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-dark">{u.name}</p>
                          <p className="text-xs text-dark/50 flex items-center gap-1">
                            {u.provider === 'GOOGLE' ? 'Google' : 'Local'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-dark">{u.email}</p>
                      <p className="text-xs text-dark/40 mt-0.5">
                        Registrado: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </td>
                    <td>
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-xs text-dark/40 font-semibold uppercase">Mascotas</p>
                          <p className="font-bold text-dark">{u._count?.pets || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-dark/40 font-semibold uppercase">Reservas</p>
                          <p className="font-bold text-dark">{u._count?.reservations || 0}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select 
                        className={`input py-1.5 pl-3 pr-8 text-xs font-semibold rounded-lg border-transparent w-32 ${
                          u.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-dark/5 text-dark/70'
                        }`}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="CLIENTE">CLIENTE</option>
                        <option value="ADMIN">ADMINISTRADOR</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        className="p-2 text-dark/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
