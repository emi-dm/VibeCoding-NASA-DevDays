import { GalaxyHybridMap } from "@/components/galaxy-hybrid-map";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mapa de galaxias · NASA",
  description:
    "Mapa celeste con galaxias Messier (RA/DEC) y búsqueda en vivo en la NASA Image and Video Library al seleccionar cada objeto.",
};

export default function MapaPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white/70 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <Link
              href="/"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              ← Volver al explorador
            </Link>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Mapa híbrido Messier + NASA
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Esfera celeste 3D interactiva (catálogo Messier). Los resultados multimedia se cargan desde la API pública
              de imágenes de la NASA al elegir una galaxia.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <GalaxyHybridMap />
      </main>
    </div>
  );
}
