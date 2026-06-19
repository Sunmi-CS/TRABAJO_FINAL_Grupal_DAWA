'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { DashboardStats, ApiResponse } from '@/types';
import { Users, PawPrint, Calendar, TrendingUp } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get<ApiResponse<DashboardStats>>('/api/dashboard');
        setStats(data.data);
      } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  // Colores para el gráfico de barras (Estados)
  const statusColors: Record<string, string> = {
    PENDING: '#f59e0b', // amber-500
    APPROVED: '#6BAC6B', // secondary
    REJECTED: '#ef4444', // red-500
    COMPLETED: '#195F6B', // primary
    CANCELLED: '#64748b', // slate-500
  };

  // Datos para gráficos
  const barData = stats.reservationsByStatus.map(s => ({
    name: s.status,
    cantidad: s.count,
    fill: statusColors[s.status] || '#195F6B'
  }));

  const pieColors = ['#195F6B', '#6BAC6B', '#FDC161', '#4fa9bc', '#fcaa33'];
  const pieData = stats.topServices.map((s, i) => ({
    name: s.service?.name || 'Servicio Eliminado',
    value: s.count,
    color: pieColors[i % pieColors.length]
  }));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Panel Administrativo</h1>
        <p className="page-subtitle">Resumen general del sistema PetCare</p>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-dark/60 text-sm font-medium">Usuarios Clientes</p>
            <p className="text-2xl font-bold text-dark">{stats.totals.users}</p>
            <p className="text-xs text-blue-600 mt-1">+{stats.totals.newUsersThisMonth} este mes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-accent/20 text-amber-700">
            <PawPrint className="w-6 h-6" />
          </div>
          <div>
            <p className="text-dark/60 text-sm font-medium">Total Mascotas</p>
            <p className="text-2xl font-bold text-dark">{stats.totals.pets}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-primary/10 text-primary">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-dark/60 text-sm font-medium">Total Reservas</p>
            <p className="text-2xl font-bold text-dark">{stats.totals.reservations}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-secondary/20 text-secondary-700">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-dark/60 text-sm font-medium">Tasa Conversión</p>
            <p className="text-2xl font-bold text-dark">
              {stats.totals.reservations > 0
                ? Math.round((stats.reservationsByStatus.find(s => s.status === 'COMPLETED')?.count || 0) / stats.totals.reservations * 100)
                : 0}%
            </p>
            <p className="text-xs text-dark/40 mt-1">Reservas completadas</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card h-[400px] flex flex-col">
          <h2 className="text-lg font-bold mb-6">Reservas por Estado</h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(17, 32, 37, 0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="cantidad" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card h-[400px] flex flex-col">
          <h2 className="text-lg font-bold mb-6">Servicios Más Solicitados</h2>
          <div className="flex-1 w-full min-h-0">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-dark/40">
                No hay datos suficientes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Últimas Reservas (Tabla) */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Últimas Reservas Generadas</h2>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente / Mascota</th>
                <th>Servicio</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentReservations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-dark/40">
                    No hay reservas recientes
                  </td>
                </tr>
              ) : (
                stats.recentReservations.map(res => (
                  <tr key={res.id}>
                    <td>
                      <div>
                        <p className="font-medium text-dark">{res.owner?.name}</p>
                        <p className="text-xs text-dark/60">{res.pet?.name} ({res.pet?.species})</p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-dark">{res.service?.name}</p>
                        <p className="text-xs text-dark/60">${res.service?.price.toFixed(2)}</p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm">{new Date(res.reservationDate).toLocaleDateString()}</p>
                        <p className="text-xs text-dark/60">{res.reservationTime}</p>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={res.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
