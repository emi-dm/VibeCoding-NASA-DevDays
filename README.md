# Explorador espacial NASA

Aplicación web fullstack con [Next.js](https://nextjs.org) que muestra imágenes y vídeos del espacio usando las APIs públicas de la NASA. **No hay registro ni inicio de sesión** para usar la app.

## APIs utilizadas

- **[NASA Image and Video Library](https://images-api.nasa.gov/)** — búsqueda y manifiestos de medios. No requiere clave de API.
- **[APOD](https://api.nasa.gov/)** (Astronomy Picture of the Day) — imagen o vídeo del día. El servidor usa `DEMO_KEY` por defecto (límites bajos) o una clave opcional.

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto (no lo subas a git):

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `NASA_API_KEY` | No | Clave gratuita de [api.nasa.gov](https://api.nasa.gov/). Aumenta el límite de peticiones a APOD (hasta unas 1.000/hora con clave propia frente a la `DEMO_KEY`). |

Sin `NASA_API_KEY`, APOD usa `DEMO_KEY` (aprox. 30 peticiones por IP y hora y 50 al día, según la documentación de la NASA).

**Nota:** Pedir la clave en api.nasa.gov es un registro ante la NASA, no en esta aplicación. La biblioteca de imágenes (`images-api.nasa.gov`) sigue sin requerir clave.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — compilación de producción
- `npm run start` — sirve la build
- `npm run lint` — ESLint

## Estructura relevante

- `app/api/search` — proxy de búsqueda a la biblioteca de imágenes.
- `app/api/asset/[nasaId]` — manifiesto de un recurso (URLs de vídeo/imagen).
- `app/api/apod` — proxy de APOD con clave en servidor.
- `lib/nasa-images.ts` — normalización de respuestas de la biblioteca de imágenes.
- `app/media/[nasaId]` — página de detalle con reproductor o imagen.

## Licencia

MIT (o la que elijas). Los contenidos multimedia pertenecen a la NASA y a sus respectivos titulares; revisa las políticas de uso en los sitios oficiales.
