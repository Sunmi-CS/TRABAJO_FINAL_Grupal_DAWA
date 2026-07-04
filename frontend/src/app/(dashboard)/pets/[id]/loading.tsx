export default function PetDetailLoading() {
  return (
    <div className="grid lg:grid-cols-3 gap-6 animate-pulse">
      {/* Columna izquierda */}
      <div className="lg:col-span-1 space-y-6">
        <div className="card text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-dark/10 rounded-t-2xl" />
          <div className="relative mt-8 mb-4">
            <div className="w-32 h-32 mx-auto rounded-full bg-dark/10" />
          </div>
          <div className="h-6 bg-dark/10 rounded-lg w-40 mx-auto mb-2" />
          <div className="h-4 bg-dark/10 rounded-lg w-28 mx-auto mb-6" />
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-dark/10">
            <div className="h-16 bg-dark/5 rounded-xl" />
            <div className="h-16 bg-dark/5 rounded-xl" />
          </div>
        </div>
        <div className="card">
          <div className="h-4 bg-dark/10 rounded w-40 mb-3" />
          <div className="space-y-2">
            <div className="h-3 bg-dark/5 rounded w-full" />
            <div className="h-3 bg-dark/5 rounded w-3/4" />
          </div>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="lg:col-span-2">
        <div className="card h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="h-5 bg-dark/10 rounded w-48" />
            <div className="h-8 bg-dark/10 rounded-lg w-28" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-dark/10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-dark/10 flex-shrink-0" />
                  <div className="space-y-2">
                    <div className="h-4 bg-dark/10 rounded w-36" />
                    <div className="h-3 bg-dark/5 rounded w-48" />
                  </div>
                </div>
                <div className="h-6 bg-dark/10 rounded-full w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
