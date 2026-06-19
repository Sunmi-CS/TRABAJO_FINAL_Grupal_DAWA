'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-dark/8 px-4 lg:px-8 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              id="mobile-menu-button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-dark/60 hover:bg-dark/5"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-dark/60 hover:bg-dark/5 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </button>

            <Link href="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary/10">
                {user?.image ? (
                  <Image src={user.image} alt={user.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="hidden md:block text-sm font-medium text-dark">{user?.name}</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
