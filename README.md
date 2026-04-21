# JM Ingeniería & Arquitectura — Plataforma de proyectos

Plataforma web para cargar proyectos y compartirlos con clientes.

## Estructura

- `/` — Landing pública
- `/portafolio` — Portafolio público completo
- `/portafolio/[slug]` — Detalle de proyecto en el portafolio
- `/admin` — Panel de administración (lista de proyectos)
- `/admin/[id]` — Editar proyecto individual
- `/p/[slug]` — Vista privada del proyecto para el cliente

## Tecnologías

- Next.js 14 (App Router)
- Supabase (base de datos, storage, auth)
- TypeScript
- Lucide React (iconos)
- QRCode (generación de QR)

## Variables de entorno

Las variables ya están configuradas en `.env.local`. Si alguna vez cambian,
actualizarlas en ese archivo (para desarrollo local) y en el panel de Vercel
(para producción).

Variables necesarias:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
