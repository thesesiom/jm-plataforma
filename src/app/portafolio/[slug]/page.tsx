import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Nav } from '@/components/Nav';
import { Gallery } from '@/components/Gallery';
import { C, F } from '@/lib/theme';
import { Proyecto, Archivo, Video } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';

export const revalidate = 60;

async function getData(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: p } = await supabase.from('proyectos').select('*')
    .eq('slug', slug).eq('publicado_portafolio', true).single();
  if (!p) return null;
  const [{ data: archivos }, { data: videos }] = await Promise.all([
    supabase.from('archivos').select('*').eq('proyecto_id', p.id)
      .in('seccion', ['photos', 'renders']).order('orden'),
    supabase.from('videos').select('*').eq('proyecto_id', p.id).order('creado_en'),
  ]);
  return {
    proyecto: p as Proyecto,
    archivos: (archivos || []) as Archivo[],
    videos: (videos || []) as Video[],
  };
}

export default async function PortafolioDetailPage({
  params,
}: { params: { slug: string } }) {
  const data = await getData(params.slug);
  if (!data) notFound();
  const { proyecto, archivos, videos } = data;
  const renders = archivos.filter(a => a.seccion === 'renders');
  const photos = archivos.filter(a => a.seccion === 'photos');

  return (
    <>
      <Nav />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 80px' }}>
        <Link href="/portafolio" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: C.inkMuted, fontSize: 13, marginBottom: 24,
        }}>
          <ArrowLeft size={14} /> Volver al portafolio
        </Link>

        {proyecto.cover_url && (
          <div style={{
            width: '100%', background: C.bgSoft,
            marginBottom: 32, overflow: 'hidden',
          }}>
            <img src={proyecto.cover_url} alt={proyecto.nombre} style={{
              width: '100%', height: 'auto', display: 'block',
              maxHeight: '70vh', objectFit: 'contain', margin: '0 auto',
            }} />
          </div>
        )}

        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr',
          gap: 60, marginBottom: 60,
        }}>
          <div>
            <div style={{
              fontSize: 11, color: C.accent, letterSpacing: '0.15em',
              textTransform: 'uppercase', marginBottom: 16,
            }}>{proyecto.tipo} · {proyecto.anio}</div>
            <h1 style={{
              fontFamily: F.display, fontSize: 'clamp(36px, 5vw, 60px)',
              fontWeight: 500, margin: 0, lineHeight: 1,
              letterSpacing: '-0.02em',
            }}>{proyecto.nombre}</h1>
            {proyecto.tagline && (
              <p style={{
                fontSize: 18, lineHeight: 1.6, color: C.inkMuted,
                marginTop: 24, maxWidth: 600,
              }}>{proyecto.tagline}</p>
            )}
            {proyecto.descripcion && (
              <p style={{
                fontSize: 15, lineHeight: 1.7, color: C.ink,
                marginTop: 16, maxWidth: 600, whiteSpace: 'pre-wrap',
              }}>{proyecto.descripcion}</p>
            )}
          </div>
          <aside style={{
            background: C.bgCard, padding: 24, borderRadius: 4,
            border: `1px solid ${C.border}`, fontSize: 14, height: 'fit-content',
          }}>
            {([
              ['Cliente', proyecto.cliente],
              ['Ubicación', proyecto.ubicacion],
              ['Año', proyecto.anio],
              ['Tipología', proyecto.tipo],
              ['Superficie', proyecto.superficie],
              ['Niveles', proyecto.niveles],
            ] as const).filter(([_, v]) => v).map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: `1px solid ${C.border}`,
              }}>
                <span style={{ color: C.inkSubtle }}>{k}</span>
                <span style={{ color: C.ink, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </aside>
        </div>

        {renders.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <SectionTitle title="Renders" />
            <Gallery images={renders.map(a => ({ id: a.id, url: a.url, nombre: a.nombre }))} />
          </section>
        )}

        {videos.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <SectionTitle title="Recorridos y videos" />
            <div style={{
              display: 'grid',
              gridTemplateColumns: videos.length === 1
                ? '1fr'
                : 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: 24,
            }}>
              {videos.map(v => (
                <div key={v.id}>
                  <div style={{
                    fontSize: 14, fontWeight: 500, marginBottom: 8, color: C.ink,
                  }}>{v.titulo}</div>
                  <VideoPlayer video={v} />
                </div>
              ))}
            </div>
          </section>
        )}

        {photos.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <SectionTitle title="Fotos de obra" />
            <Gallery images={photos.map(a => ({ id: a.id, url: a.url, nombre: a.nombre }))} />
          </section>
        )}
      </div>
    </>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{
        fontFamily: F.display, fontSize: 28, fontWeight: 500, margin: 0,
        letterSpacing: '-0.01em', color: C.ink,
      }}>{title}</h3>
      <div style={{ width: 48, height: 2, background: C.accent, marginTop: 12 }} />
    </div>
  );
}
