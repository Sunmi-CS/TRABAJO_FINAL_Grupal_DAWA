import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceso',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-6xl select-none"
              style={{
                top: `${(i * 17) % 100}%`,
                left: `${(i * 23) % 100}%`,
                opacity: 0.3 + (i % 5) * 0.1,
                transform: `rotate(${i * 30}deg)`,
                fontSize: `${2 + (i % 3)}rem`,
              }}
            >
              🐾
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center w-full">
          <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center text-4xl mb-8 shadow-lg">
            🐾
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">PetCare</h1>
          <p className="text-white/70 text-lg max-w-sm leading-relaxed">
            La plataforma más completa para el cuidado y gestión de tu guardería de mascotas
          </p>

          <div className="mt-12 grid grid-cols-1 gap-4 w-full max-w-xs">
            {[
              { emoji: '🏠', text: 'Guardería segura y amorosa' },
              { emoji: '📅', text: 'Reservas en línea fáciles' },
              { emoji: '📊', text: 'Seguimiento en tiempo real' },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 glass rounded-xl px-4 py-3 text-left"
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-white/90 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg">
              🐾
            </div>
            <h1 className="text-2xl font-bold text-dark">PetCare</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
