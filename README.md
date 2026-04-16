# Explorador espacial NASA

Aplicación web fullstack construida con [Next.js](https://nextjs.org) para explorar imágenes y vídeos públicos del espacio usando APIs de la NASA.

> **No hay registro ni login en esta app.**

---

## Qué hace la aplicación

La app ofrece tres experiencias principales:

1. **APOD del día** (Astronomy Picture of the Day), con imagen o vídeo destacado.
2. **Buscador de la biblioteca NASA** (texto + filtros por tipo de medio + rango de años).
3. **Mapa 3D de galaxias Messier**, que lanza búsquedas en vivo en la NASA al seleccionar objetos.

Además, cada resultado permite abrir una **vista de detalle** en `/media/[nasaId]` para reproducir vídeo o ver imagen en grande.

---

## APIs utilizadas

- **[NASA Image and Video Library](https://images-api.nasa.gov/)**
  - Se usa para búsqueda (`/search`) y manifiestos de recursos (`/asset/:id`).
  - **No requiere API key**.

- **[NASA APOD (api.nasa.gov)](https://api.nasa.gov/)**
  - Se usa para “Astronomy Picture of the Day”.
  - Soporta `DEMO_KEY` (limitada) o tu propia `NASA_API_KEY`.

---

## Requisitos

- Node.js (recomendado: versión LTS actual)
- npm

---

## Configuración rápida

### 1) Instalar dependencias

```bash
npm install
```

### 2) Crear variables de entorno

Crea `.env.local` en la raíz del proyecto (no lo subas a git):

- `NASA_API_KEY` (opcional): clave gratuita de [api.nasa.gov](https://api.nasa.gov/) para ampliar cuota de APOD.

Ejemplo:

```env
NASA_API_KEY=TU_API_KEY_AQUI
```

Si no defines `NASA_API_KEY`, APOD usa `DEMO_KEY` automáticamente.

> Pedir API key en `api.nasa.gov` es un registro con la NASA, no con esta app.

### 3) Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Cómo usar la app

### Inicio (`/`)

- Verás la sección **APOD** en la parte superior.
- Debajo, el buscador de la biblioteca NASA:
  - término de búsqueda,
  - tipo de medio (`image`, `video` o ambos),
  - filtro por años (`YYYY` a `YYYY`).

Cada tarjeta abre el detalle en `/media/[nasaId]`.

### Mapa de galaxias (`/mapa`)

- Mapa celeste 3D interactivo con catálogo Messier.
- Al hacer clic en una galaxia (o centro galáctico), se ejecuta búsqueda NASA en vivo.
- Puedes aplicar el mismo filtro por años para acotar resultados.

### Detalle de recurso (`/media/[nasaId]`)

- Muestra el recurso principal (vídeo o imagen).
- Si hay múltiples calidades de vídeo, lista enlaces adicionales.
- Incluye acceso directo a la ficha oficial en `images.nasa.gov`.

---

## Endpoints internos (API routes)

La app consume NASA desde el servidor mediante rutas internas:

- `GET /api/apod`
  - Query opcional: `date=YYYY-MM-DD`
  - Respuesta: payload APOD normalizado por la app.

- `GET /api/search`
  - Query:
    - `q` (obligatorio)
    - `page` (opcional)
    - `page_size` (opcional)
    - `media_type` (`image`, `video`, `audio` o por defecto `image,video`)
    - `year_start` / `year_end` (opcionales, formato `YYYY`)
  - Incluye lógica de fallback de consulta y validación de años.

- `GET /api/asset/[nasaId]`
  - Devuelve URLs de media normalizadas para ese identificador NASA.

---

## Scripts disponibles

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run start` — arranque en producción
- `npm run lint` — análisis con ESLint

---

## Estructura del proyecto (resumen)

- `app/page.tsx` — home (APOD + buscador)
- `app/mapa/page.tsx` — vista mapa 3D
- `app/media/[nasaId]/page.tsx` — detalle de recurso
- `app/api/apod/route.ts` — proxy APOD con clave en servidor
- `app/api/search/route.ts` — proxy y normalización de búsqueda NASA
- `app/api/asset/[nasaId]/route.ts` — proxy de manifiesto de recurso
- `components/` — UI cliente (buscador, APOD, mapa híbrido)
- `lib/` — utilidades de normalización, catálogo y validaciones

---

## Troubleshooting rápido

- **Error 429 en APOD**
  - Has alcanzado límite de cuota. Configura `NASA_API_KEY` propia.

- **Sin resultados en búsqueda**
  - Prueba términos en inglés o más generales.
  - Amplía o elimina el filtro de años.

- **Contenido multimedia no disponible**
  - Algunos manifiestos NASA no incluyen un recurso reproducible directo.

---

## Aviso legal

Este proyecto **no está afiliado a la NASA**. Los contenidos multimedia pertenecen a la NASA y/o a sus titulares respectivos; revisa las políticas de uso en los sitios oficiales.

## Licencia

MIT.
