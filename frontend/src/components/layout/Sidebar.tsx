'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import {
  LayoutDashboard,
  PawPrint,
  Calendar,
  Scissors,
  User,
  LogOut,
  Users,
  BarChart3,
  X,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const clientLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pets', label: 'Mis Mascotas', icon: PawPrint },
  { href: '/services', label: 'Servicios', icon: Scissors },
  { href: '/reservations', label: 'Mis Reservas', icon: Calendar },
  { href: '/profile', label: 'Mi Perfil', icon: User },
];

const adminLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/admin', label: 'Estadísticas', icon: BarChart3 },
  { href: '/pets', label: 'Mascotas', icon: PawPrint },
  { href: '/services', label: 'Servicios', icon: Scissors },
  { href: '/reservations', label: 'Reservas', icon: Calendar },
  { href: '/dashboard/admin/users', label: 'Usuarios', icon: Users },
  { href: '/profile', label: 'Mi Perfil', icon: User },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = user?.role === 'ADMIN' ? adminLinks : clientLinks;

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-dark/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full w-64 gradient-primary z-40 flex flex-col transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-lg">
              🐾
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">PetCare</h1>
              <p className="text-white/50 text-xs">Guardería</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
              {user?.image ? (
                <Image src={user.image} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white font-medium text-sm truncate">{user?.name}</p>
              <p className="text-white/50 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href ||
                (link.href !== '/dashboard' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={clsx(
                    isActive ? 'sidebar-link-active' : 'sidebar-link',
                    'group',
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{link.label}</span>
                  {isActive && (
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => logout()}
            className="sidebar-link w-full text-red-300 hover:text-red-100 hover:bg-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
