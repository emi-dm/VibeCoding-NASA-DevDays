import { ApodSection } from "@/components/apod-section";
import { SearchExplorer } from "@/components/search-explorer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white/70 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              NASA · archivo abierto
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Explorador espacial
            </h1>
            <p className="mt-1 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
              Imágenes y vídeos públicos de la NASA. Sin cuentas ni inicio de sesión en esta aplicación.
            </p>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link
              className="rounded-full border border-transparent bg-zinc-900 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              href="/mapa"
            >
              Mapa galaxias
            </Link>
            <a
              className="rounded-full border border-zinc-300 px-4 py-2 font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
              href="https://images.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Biblioteca oficial
            </a>
            <a
              className="rounded-full border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-indigo-500"
              href="https://api.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
            >
              api.nasa.gov
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-10 sm:px-6">
        <ApodSection />
        <SearchExplorer />
      </main>

      <footer className="mt-auto border-t border-zinc-200 bg-white/60 py-6 text-center text-xs text-zinc-500 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
        Datos:{" "}
        <Link className="text-indigo-600 hover:underline dark:text-indigo-400" href="https://images-api.nasa.gov/">
          NASA Image and Video Library API
        </Link>{" "}
        y{" "}
        <Link className="text-indigo-600 hover:underline dark:text-indigo-400" href="https://api.nasa.gov/">
          APOD
        </Link>
        . Este proyecto no está afiliado a la NASA.
      </footer>
    </div>
  );
}
