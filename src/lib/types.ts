export type Proyecto = {
  id: string;
  slug: string;
  nombre: string;
  cliente: string | null;
  tipo: string | null;
  ubicacion: string | null;
  anio: number | null;
  superficie: string | null;
  niveles: string | null;
  descripcion: string | null;
  tagline: string | null;
  estado: string;
  avance: number;
  cover_url: string | null;
  archivado: boolean;
  publicado_portafolio: boolean;
  descargas_habilitadas: boolean;
  creado_en: string;
  actualizado_en: string;
};

export type Archivo = {
  id: string;
  proyecto_id: string;
  seccion: string;
  nombre: string;
  tipo: string | null;
  tamano_bytes: number | null;
  url: string;
  storage_path: string | null;
  orden: number;
  creado_en: string;
};

export type Video = {
  id: string;
  proyecto_id: string;
  titulo: string;
  url: string;
  plataforma: string;
  duracion: string | null;
  creado_en: string;
};

export type Comentario = {
  id: string;
  proyecto_id: string;
  seccion: string;
  autor: string;
  texto: string;
  creado_en: string;
};

export type Aprobacion = {
  id: string;
  proyecto_id: string;
  seccion: string;
  aprobado: boolean;
  aprobado_en: string | null;
};

export type Evento = {
  id: string;
  proyecto_id: string;
  fecha: string;
  titulo: string;
  descripcion: string | null;
  creado_en: string;
};

export const SECCIONES = [
  { id: 'photos', label: 'Fotos del sitio' },
  { id: 'renders', label: 'Renders' },
  { id: 'videos', label: 'Videos' },
  { id: 'planos', label: 'Planos' },
  { id: 'cotizacion', label: 'Cotización' },
  { id: 'computos', label: 'Cómputos' },
] as const;
