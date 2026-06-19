import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Pet, ApiResponse } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Edit2, Calendar, Scale, Clock, Activity, PawPrint } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';

// Helper SSR para hacer fetch con el token
async function getPet(id: string): Promise<Pet | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('petcare_token')?.value;

  if (!token) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pets/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store', // SSR, no cache
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Error fetching pet');
    }

    const json = (await res.json()) as ApiResponse<Pet>;
    return json.data;
  } catch (error) {
    console.error('Error in SSR getPet:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const pet = await getPet(resolvedParams.id);
  
  if (!pet) {
    return { title: 'Mascota no encontrada' };
  }

  return {
    title: `${pet.name} | PetCare`,
    description: `Perfil de ${pet.name}, un ${pet.species} de ${pet.age} años en PetCare.`,
  };
}

export default async function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const pet = await getPet(resolvedParams.id);

  if (!pet) {
    notFound();
  }

  // Obtener rol del usuario del token
  const cookieStore = await cookies();
  const token = cookieStore.get('petcare_token')?.value;
  let isAdmin = false;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      isAdmin = payload?.role === 'ADMIN';
    } catch (e) {
      // Ignorar error de parsing
    }
  }

  // @ts-expect-error - Pet relation type has reservations array in this endpoint
  const reservations = pet.reservations || [];

  return (
    <>
      <PageHeader 
        actions={
          <div className="flex gap-3">
            <Link href="/pets" className="btn-outline bg-white">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Link>
            {!isAdmin && (
              <Link href={`/pets/${pet.id}/edit`} className="btn-primary">
                <Edit2 className="w-4 h-4" /> Editar
              </Link>
            )}
          </div>
        }
      />
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Perfil Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 gradient-primary" />
            <div className="relative mt-8 mb-4">
              <div className="w-32 h-32 mx-auto rounded-full border-4 border-white overflow-hidden bg-dark/5 shadow-md relative">
                {pet.photoUrl ? (
                  <Image src={pet.photoUrl} alt={pet.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-dark">{pet.name}</h2>
            <p className="text-dark/60 font-medium mb-6">{pet.species} {pet.breed ? `• ${pet.breed}` : ''}</p>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-dark/10">
              <div className="text-center p-3 rounded-xl bg-dark/2">
                <Clock className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-dark/40 text-xs uppercase font-semibold">Edad</p>
                <p className="font-bold text-dark">{pet.age} años</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-dark/2">
                <Scale className="w-5 h-5 mx-auto text-secondary mb-1" />
                <p className="text-dark/40 text-xs uppercase font-semibold">Peso</p>
                <p className="font-bold text-dark">{pet.weight} kg</p>
              </div>
            </div>
          </div>

          {pet.notes && (
            <div className="card">
              <h3 className="font-bold text-dark mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                Observaciones Médicas
              </h3>
              <p className="text-dark/70 text-sm leading-relaxed bg-accent/10 p-4 rounded-xl border border-accent/20">
                {pet.notes}
              </p>
            </div>
          )}
        </div>

        {/* Columna Derecha: Historial */}
        <div className="lg:col-span-2">
          <div className="card h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Historial de Reservas
              </h2>
              <Link href="/reservations/new" className="btn-ghost text-primary hover:bg-primary/10">
                Nueva Reserva
              </Link>
            </div>

            {reservations.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-dark/10 rounded-2xl">
                <div className="w-16 h-16 bg-dark/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-dark/30" />
                </div>
                <p className="text-dark/60 font-medium mb-4">Esta mascota aún no tiene reservas.</p>
                <Link href="/reservations/new" className="btn-outline">
                  Programar primera reserva
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((res: any) => (
                  <div key={res.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-dark/10 hover:border-primary/30 transition-colors bg-white shadow-sm">
                    <div className="flex items-start gap-4 mb-3 sm:mb-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary mt-0.5">
                        <PawPrint className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-dark">{res.service?.name}</h4>
                        <div className="text-sm text-dark/60 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          <span>📅 {new Date(res.reservationDate).toLocaleDateString()}</span>
                          <span>⏰ {res.reservationTime}</span>
                          <span className="font-medium text-dark/80">${res.service?.price.toFixed(2)}</span>
                        </div>
                        {res.notes && (
                          <p className="text-xs text-dark/50 mt-2 bg-dark/5 p-2 rounded-lg inline-block">
                            📝 {res.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <StatusBadge status={res.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
