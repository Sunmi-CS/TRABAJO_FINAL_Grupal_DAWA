import Link from 'next/link';
import { ArrowRight, PawPrint, Calendar, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="absolute top-0 w-full z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-xl shadow-lg">
            🐾
          </div>
          <span className="text-xl font-bold text-dark">PetCare</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-dark font-medium hover:text-primary transition-colors">
            Iniciar Sesión
          </Link>
          <Link href="/register" className="btn-primary">
            Registrarse
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <h1 className="text-5xl lg:text-7xl font-extrabold text-dark tracking-tight mb-6 text-balance">
              El mejor cuidado para tu mejor <span className="text-primary">amigo</span>
            </h1>
            <p className="text-lg lg:text-xl text-dark/70 mb-10 max-w-2xl mx-auto text-balance">
              Una plataforma moderna para gestionar las reservas, vacunas y el cuidado de tu mascota en nuestra guardería premium.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-primary !px-8 !py-4 !text-base w-full sm:w-auto">
                Empezar ahora <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/services" className="btn-outline !px-8 !py-4 !text-base w-full sm:w-auto bg-white">
                Ver servicios
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-dark mb-4">¿Por qué elegir PetCare?</h2>
            <p className="text-dark/60 max-w-2xl mx-auto">
              Diseñamos nuestra guardería pensando en la felicidad de las mascotas y la tranquilidad de sus dueños.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-hover text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Seguridad Total</h3>
              <p className="text-dark/60 text-sm">
                Instalaciones diseñadas específicamente para mascotas, con supervisión 24/7 y personal capacitado en primeros auxilios.
              </p>
            </div>

            <div className="card-hover text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mx-auto mb-6">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Reservas Fáciles</h3>
              <p className="text-dark/60 text-sm">
                Programa desde guardería por horas hasta estadías largas de forma rápida y sencilla desde nuestra plataforma online.
              </p>
            </div>

            <div className="card-hover text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-amber-600 mx-auto mb-6">
                <PawPrint className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Cuidado Personalizado</h3>
              <p className="text-dark/60 text-sm">
                Atención individualizada para cada mascota, respetando sus dietas, medicinas y preferencias de juego.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-sm">
              🐾
            </div>
            <span className="text-xl font-bold">PetCare</span>
          </div>
          <p className="text-white/50 text-sm">
            &copy; {new Date().getFullYear()} PetCare. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
