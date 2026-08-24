import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-coral-500 flex items-center justify-center text-3xl font-bold mb-6">
        P
      </div>
      <h1 className="text-4xl font-bold mb-2">Pratto</h1>
      <p className="text-neutral-400 text-lg mb-10">Cardápio digital e PDV para restaurantes</p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/tacos"
          className="flex-1 bg-coral-500 hover:bg-coral-600 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
        >
          Ver cardápio →
        </Link>
        <Link
          href="/login"
          className="flex-1 bg-team-500 hover:bg-team-600 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
        >
          Acesso equipe →
        </Link>
      </div>

      <p className="text-neutral-600 text-xs mt-12">v1.0 · Pratto B2Food</p>
    </div>
  );
}
