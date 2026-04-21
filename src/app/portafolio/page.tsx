import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Nav } from '@/components/Nav';
import { C, F } from '@/lib/theme';
import { Proyecto } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

export const revalidate = 60;

async function getProyectos(): Promise<Proyecto[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('proyectos')
    .select('*')
    .eq('publicado_portafolio', true)
    .order('anio', { ascending: false });
  return data || [];
}

export default async function PortafolioPage() {
  const proyectos = await getProyectos();
  return (
    <>
      <Nav />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{
          fontSize: 11, color: C.accent, letterSpacing: '0.15em',
          textTransform: 'uppercase', marginBottom: 12, fontWeight: 600,
        }}>Portafolio</div>
        <h1 style={{
          fontFamily: F.display, fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 500, margin: 0, letterSpacing: '-0.02em',
        }}>Obra completa</h1>
        <p style={{
          fontSize: 17, color: C.inkMuted, maxWidth: 560, marginTop: 16,
        }}>{proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''} publicado{proyectos.length !== 1 ? 's' : ''}.</p>

        {proyectos.length === 0 ? (
          <div style={{
            marginTop: 40, padding: 60, textAlign: 'center',
            background: C.bgCard, border: `1px solid ${C.border}`,
          }}>
            <p style={{ color: C.inkMuted, margin: 0 }}>
              No hay proyectos publicados todavía.
            </p>
          </div>
        ) : (
          <div style={{
            marginTop: 60,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 40,
          }}>
            {proyectos.map((p, i) => (
              <Link key={p.id} href={`/portafolio/${p.slug}`} className="project-card"
                style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="project-card-img" style={{
                  aspectRatio: '4/5', position: 'relative', background: C.bgSoft,
                }}>
                  {p.cover_url && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: `url(${p.cover_url}) center/cover`,
                    }} />
                  )}
                  <div style={{
                    position: 'absolute', top: 16, left: 16, zIndex: 1,
                    background: C.bg, padding: '4px 10px', fontSize: 11,
                    fontWeight: 500, letterSpacing: '0.05em',
                  }}>{String(i + 1).padStart(2, '0')} / {p.tipo}</div>
                </div>
                <div style={{ paddingTop: 16 }}>
                  <div style={{
                    fontFamily: F.display, fontSize: 24, fontWeight: 500,
                    marginBottom: 4,
                  }}>{p.nombre}</div>
                  <div style={{ fontSize: 14, color: C.inkMuted, marginBottom: 8 }}>
                    {p.ubicacion} · {p.anio}
                  </div>
                  <div style={{
                    fontSize: 13, color: C.accent, display: 'flex',
                    alignItems: 'center', gap: 4, fontWeight: 500,
                  }}>
                    Ver proyecto <span className="card-arrow"><ArrowRight size={13} /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
