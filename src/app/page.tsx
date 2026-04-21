import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Nav } from '@/components/Nav';
import { C, F } from '@/lib/theme';
import { Proyecto } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

export const revalidate = 60;

async function getProyectosPortafolio(): Promise<Proyecto[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data, error } = await supabase
    .from('proyectos')
    .select('*')
    .eq('publicado_portafolio', true)
    .order('anio', { ascending: false })
    .limit(6);
  if (error) return [];
  return data || [];
}

export default async function HomePage() {
  const proyectos = await getProyectosPortafolio();
  return (
    <>
      <Nav />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 80px' }}>
        <section style={{
          padding: '80px 0 60px', position: 'relative', overflow: 'hidden',
        }}>
          <img src="/logo-jm.png" alt="" aria-hidden style={{
            position: 'absolute', right: -40, top: 20,
            width: 'min(520px, 50vw)', opacity: 0.05,
            pointerEvents: 'none', zIndex: 0,
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: 11, fontWeight: 500, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: C.accent, marginBottom: 24,
            }}>
              JM Ingeniería & Arquitectura
            </div>
            <h1 style={{
              fontFamily: F.display, fontSize: 'clamp(48px, 8vw, 96px)',
              fontWeight: 500, lineHeight: 0.95, margin: 0,
              letterSpacing: '-0.02em', color: C.ink,
            }}>
              Cálculo estructural<br/>
              <span style={{ fontStyle: 'italic', color: C.accent }}>
                y diseño arquitectónico
              </span><br/>
              con criterio.
            </h1>
            <p style={{
              fontSize: 17, lineHeight: 1.6, color: C.inkMuted,
              maxWidth: 560, marginTop: 32,
            }}>
              Proyectos residenciales, comerciales e infraestructura.
              Cada uno documentado con la precisión que un ingeniero civil exige
              y la claridad visual que un cliente necesita.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
              <Link href="/portafolio" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 24px', background: C.ink, color: C.bg,
                borderRadius: 4, fontSize: 14, fontWeight: 500,
              }}>
                Ver portafolio <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 1, background: C.border, border: `1px solid ${C.border}`,
          marginBottom: 80,
        }}>
          {[
            { n: '01', t: 'Cálculo estructural', d: 'Concreto, acero, mampostería. Normativa vigente.' },
            { n: '02', t: 'Diseño arquitectónico', d: 'Residencial y comercial. Renders y recorridos 3D.' },
            { n: '03', t: 'Cómputos y cotización', d: 'Presupuestos detallados listos para obra.' },
            { n: '04', t: 'Dirección de obra', d: 'Supervisión técnica y control de ejecución.' },
          ].map(s => (
            <div key={s.n} style={{ background: C.bg, padding: '32px 24px' }}>
              <div style={{
                fontSize: 11, color: C.accent, fontWeight: 600,
                letterSpacing: '0.1em', marginBottom: 12,
              }}>{s.n}</div>
              <div style={{
                fontFamily: F.display, fontSize: 20, fontWeight: 500,
                marginBottom: 8,
              }}>{s.t}</div>
              <div style={{ fontSize: 14, color: C.inkMuted, lineHeight: 1.5 }}>{s.d}</div>
            </div>
          ))}
        </section>

        {proyectos.length > 0 && (
          <section id="proyectos">
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              borderBottom: `1px solid ${C.borderDark}`, paddingBottom: 20, marginBottom: 40,
            }}>
              <h2 style={{
                fontFamily: F.display, fontSize: 40, fontWeight: 500,
                margin: 0, letterSpacing: '-0.02em',
              }}>Obra seleccionada</h2>
              <Link href="/portafolio" style={{
                fontSize: 13, color: C.accent, fontWeight: 500,
              }}>
                Ver todo →
              </Link>
            </div>
            <div style={{
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
          </section>
        )}

        {proyectos.length === 0 && (
          <section style={{
            padding: 60, textAlign: 'center',
            background: C.bgCard, border: `1px solid ${C.border}`,
          }}>
            <h3 style={{
              fontFamily: F.display, fontSize: 28, fontWeight: 500, marginTop: 0,
            }}>El portafolio está en construcción</h3>
            <p style={{ color: C.inkMuted, maxWidth: 480, margin: '16px auto 0' }}>
              Pronto verás aquí los proyectos destacados.
              Entra al <Link href="/admin" style={{ color: C.accent }}>panel admin</Link> para
              empezar a cargar.
            </p>
          </section>
        )}
      </div>
    </>
  );
}
