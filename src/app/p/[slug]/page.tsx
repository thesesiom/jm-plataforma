'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Proyecto, Archivo, Video, Comentario, Aprobacion, SECCIONES } from '@/lib/types';
import { Logo } from '@/components/Logo';
import { C, F } from '@/lib/theme';
import {
  MapPin, Lock, CheckCircle2, MessageCircle, Eye, Download,
  FileText, Image as ImageIcon, Box, Video as VideoIcon,
  Calculator, Building2, Play,
} from 'lucide-react';

const ICONS: Record<string, any> = {
  photos: ImageIcon, renders: Box, videos: VideoIcon,
  planos: FileText, cotizacion: Calculator, computos: Calculator,
};

export default function ClientViewPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [aprobaciones, setAprobaciones] = useState<Aprobacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState('overview');
  const [autorNombre, setAutorNombre] = useState('');
  const [nuevoComentario, setNuevoComentario] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('clienteNombre');
    if (saved) setAutorNombre(saved);
  }, []);

  useEffect(() => {
    if (slug) cargar();
  }, [slug]);

  async function cargar() {
    setLoading(true);
    const { data: p } = await supabase.from('proyectos').select('*').eq('slug', slug).single();
    if (!p) { setLoading(false); return; }
    setProyecto(p);
    const [{ data: a }, { data: v }, { data: c }, { data: ap }] = await Promise.all([
      supabase.from('archivos').select('*').eq('proyecto_id', p.id).order('orden'),
      supabase.from('videos').select('*').eq('proyecto_id', p.id),
      supabase.from('comentarios').select('*').eq('proyecto_id', p.id).order('creado_en'),
      supabase.from('aprobaciones').select('*').eq('proyecto_id', p.id),
    ]);
    setArchivos(a || []); setVideos(v || []);
    setComentarios(c || []); setAprobaciones(ap || []);
    setLoading(false);
  }

  async function enviarComentario(seccion: string) {
    if (!proyecto || !nuevoComentario.trim()) return;
    const autor = autorNombre.trim() || 'Cliente';
    localStorage.setItem('clienteNombre', autor);
    await supabase.from('comentarios').insert({
      proyecto_id: proyecto.id, seccion, autor, texto: nuevoComentario.trim(),
    });
    setNuevoComentario('');
    await cargar();
  }

  async function toggleAprobacion(seccion: string) {
    if (!proyecto) return;
    const existente = aprobaciones.find(a => a.seccion === seccion);
    const nuevoValor = !(existente?.aprobado ?? false);
    await supabase.from('aprobaciones').upsert({
      proyecto_id: proyecto.id,
      seccion,
      aprobado: nuevoValor,
      aprobado_en: nuevoValor ? new Date().toISOString() : null,
    }, { onConflict: 'proyecto_id,seccion' });
    await cargar();
  }

  if (loading) return <div style={{ padding: 80, textAlign: 'center', color: C.inkMuted }}>Cargando...</div>;
  if (!proyecto) return <div style={{ padding: 80, textAlign: 'center' }}>
    <h2>Proyecto no encontrado</h2>
    <p style={{ color: C.inkMuted }}>Verifica que el link sea correcto.</p>
  </div>;

  const aprobacionSeccion = (sec: string) =>
    aprobaciones.find(a => a.seccion === sec)?.aprobado ?? false;

  const sectionsDisponibles = [
    { id: 'overview', label: 'Resumen', icon: Building2 },
    ...SECCIONES.map(s => ({ ...s, icon: ICONS[s.id] || FileText })),
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(244, 248, 252, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '16px 24px',
        }}>
          <Logo size="sm" />
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', background: C.successBg,
          border: `1px solid ${C.successBorder}`, borderRadius: 4,
          fontSize: 13, marginBottom: 20, color: C.success,
        }}>
          <Lock size={14} /> Acceso privado a tu proyecto · link único
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 1fr',
          gap: 32, marginBottom: 32,
        }}>
          <div>
            <div style={{
              fontSize: 11, color: C.accent, letterSpacing: '0.15em',
              textTransform: 'uppercase', marginBottom: 12, fontWeight: 600,
            }}>Proyecto · {proyecto.tipo}</div>
            <h1 style={{
              fontFamily: F.display, fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 500, margin: 0, letterSpacing: '-0.02em', lineHeight: 1,
            }}>{proyecto.nombre}</h1>
            {proyecto.ubicacion && (
              <div style={{ marginTop: 16, color: C.inkMuted, fontSize: 15 }}>
                <MapPin size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                {proyecto.ubicacion}
              </div>
            )}
          </div>
          <div style={{
            background: C.bgCard, border: `1px solid ${C.border}`,
            padding: 20, borderRadius: 4,
          }}>
            <div style={{ fontSize: 12, color: C.inkSubtle, marginBottom: 6 }}>Estado</div>
            <div style={{
              display: 'inline-block', padding: '4px 10px',
              background: C.bgGold, color: C.accent, fontSize: 12,
              fontWeight: 600, borderRadius: 3, marginBottom: 16,
            }}>{proyecto.estado}</div>
            <div style={{ fontSize: 12, color: C.inkSubtle, marginBottom: 6 }}>Avance</div>
            <div style={{
              height: 8, background: C.border, borderRadius: 4,
              overflow: 'hidden', marginBottom: 4,
            }}>
              <div style={{
                height: '100%', width: `${proyecto.avance}%`, background: C.accent,
              }} />
            </div>
            <div style={{ fontSize: 13, color: C.ink, fontWeight: 600 }}>
              {proyecto.avance}% completado
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 2, marginBottom: 32, overflow: 'auto',
          borderBottom: `1px solid ${C.border}`,
        }}>
          {sectionsDisponibles.map(s => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <button key={s.id} onClick={() => setSection(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '12px 16px', background: 'none', border: 'none',
                borderBottom: `2px solid ${active ? C.ink : 'transparent'}`,
                color: active ? C.ink : C.inkMuted,
                fontSize: 13, fontWeight: active ? 600 : 400,
                whiteSpace: 'nowrap',
              }}>
                <Icon size={14} /> {s.label}
              </button>
            );
          })}
        </div>

        {section === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr', gap: 32 }}>
            <div>
              {proyecto.cover_url && (
                <div style={{
                  aspectRatio: '16/9',
                  background: `url(${proyecto.cover_url}) center/cover`,
                  marginBottom: 24,
                }} />
              )}
              <h3 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 500, marginTop: 0 }}>
                Resumen del proyecto
              </h3>
              <p style={{ color: C.inkMuted, lineHeight: 1.7, fontSize: 15, whiteSpace: 'pre-wrap' }}>
                {proyecto.descripcion || proyecto.tagline || 'Sin descripción todavía.'}
              </p>
            </div>
            <aside>
              <div style={{
                background: C.bgCard, border: `1px solid ${C.border}`,
                padding: 20, borderRadius: 4, marginBottom: 16,
              }}>
                <h4 style={{
                  fontSize: 13, fontWeight: 600, color: C.inkSubtle,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  margin: '0 0 16px',
                }}>Ficha técnica</h4>
                {([
                  ['Cliente', proyecto.cliente],
                  ['Tipología', proyecto.tipo],
                  ['Año', proyecto.anio],
                  ['Ubicación', proyecto.ubicacion],
                  ['Superficie', proyecto.superficie],
                  ['Niveles', proyecto.niveles],
                ] as const).filter(([_, v]) => v).map(([k, v]) => (
                  <div key={k} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 0', fontSize: 13,
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    <span style={{ color: C.inkSubtle }}>{k}</span>
                    <span style={{ color: C.ink, fontWeight: 500, textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        )}

        {SECCIONES.map(sec => {
          if (section !== sec.id) return null;
          const esImagen = sec.id === 'photos' || sec.id === 'renders';
          const esVideos = sec.id === 'videos';
          const archivosSeccion = archivos.filter(a => a.seccion === sec.id);
          const comentariosSeccion = comentarios.filter(c => c.seccion === sec.id);
          const aprobado = aprobacionSeccion(sec.id);

          return (
            <div key={sec.id}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 20,
                flexWrap: 'wrap', gap: 12,
              }}>
                <div style={{ flex: '1 1 280px' }}>
                  <h3 style={{
                    fontFamily: F.display, fontSize: 26, fontWeight: 500, margin: 0,
                    letterSpacing: '-0.01em',
                  }}>{sec.label}</h3>
                  <div style={{ width: 48, height: 2, background: C.accent, marginTop: 12 }} />
                </div>
                <button onClick={() => toggleAprobacion(sec.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 4,
                  border: `1px solid ${aprobado ? C.success : C.borderDark}`,
                  background: aprobado ? C.successBg : 'transparent',
                  color: aprobado ? C.success : C.ink,
                  fontSize: 13, fontWeight: 500,
                }}>
                  <CheckCircle2 size={14} />
                  {aprobado ? 'Aprobado' : 'Aprobar esta sección'}
                </button>
              </div>

              {esImagen && archivosSeccion.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 8,
                }}>
                  {archivosSeccion.map(a => (
                    <div key={a.id} style={{
                      aspectRatio: '4/3', background: `url(${a.url}) center/cover`,
                    }} />
                  ))}
                </div>
              )}

              {esVideos && (
                <div style={{ display: 'grid', gap: 20 }}>
                  {videos.length === 0 && (
                    <div style={{ padding: 40, background: C.bgCard, textAlign: 'center', color: C.inkMuted, borderRadius: 4 }}>
                      Aún no hay videos.
                    </div>
                  )}
                  {videos.map(v => {
                    const embed = toEmbedUrl(v.url);
                    return (
                      <div key={v.id}>
                        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{v.titulo}</div>
                        {embed ? (
                          <div style={{ aspectRatio: '16/9', background: '#000' }}>
                            <iframe src={embed} style={{ width: '100%', height: '100%', border: 0 }}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen />
                          </div>
                        ) : (
                          <a href={v.url} target="_blank" style={{ color: C.accent }}>Abrir video</a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!esImagen && !esVideos && (
                <div style={{
                  border: `1px solid ${C.border}`, borderRadius: 4, background: C.bgWhite,
                }}>
                  {archivosSeccion.length === 0 && (
                    <div style={{ padding: 40, textAlign: 'center', color: C.inkMuted }}>
                      Aún no hay archivos en esta sección.
                    </div>
                  )}
                  {archivosSeccion.map((a, i) => (
                    <div key={a.id} className="file-row" style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '14px 16px',
                      borderBottom: i < archivosSeccion.length - 1 ? `1px solid ${C.border}` : 'none',
                    }}>
                      <div style={{
                        width: 40, height: 40, background: C.bgGold,
                        borderRadius: 4, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: C.accent,
                      }}>
                        <FileText size={18} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nombre}</div>
                        <div style={{ fontSize: 12, color: C.inkSubtle }}>
                          {a.tipo || 'Archivo'}{a.tamano_bytes ? ` · ${(a.tamano_bytes / 1024 / 1024).toFixed(2)} MB` : ''}
                        </div>
                      </div>
                      <a href={a.url} target="_blank" style={{
                        padding: '8px 12px', background: 'transparent',
                        border: `1px solid ${C.border}`, borderRadius: 4,
                        fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <Eye size={13} /> Ver
                      </a>
                      {proyecto.descargas_habilitadas ? (
                        <a href={a.url} download style={{
                          padding: '8px 12px', background: C.ink, color: C.bg,
                          borderRadius: 4, fontSize: 12,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <Download size={13} /> Descargar
                        </a>
                      ) : (
                        <span style={{
                          padding: '8px 12px', background: C.bgSoft,
                          borderRadius: 4, fontSize: 12, color: C.inkSubtle,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <Lock size={13} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {esImagen && archivosSeccion.length === 0 && (
                <div style={{ padding: 40, background: C.bgCard, textAlign: 'center', color: C.inkMuted, borderRadius: 4 }}>
                  Aún no hay {sec.label.toLowerCase()} en esta sección.
                </div>
              )}

              <div style={{
                marginTop: 32, padding: 20, background: C.bgCard,
                border: `1px solid ${C.border}`, borderRadius: 4,
              }}>
                <h4 style={{
                  fontSize: 13, fontWeight: 600, color: C.inkSubtle,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <MessageCircle size={13} /> Comentarios ({comentariosSeccion.length})
                </h4>
                {comentariosSeccion.map((c, i) => (
                  <div key={c.id} style={{
                    padding: '12px 0',
                    borderBottom: i < comentariosSeccion.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{c.autor}</span>
                      <span style={{ fontSize: 12, color: C.inkSubtle }}>
                        {new Date(c.creado_en).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, color: C.inkMuted }}>{c.texto}</div>
                  </div>
                ))}
                <div style={{ marginTop: 16 }}>
                  <input value={autorNombre} onChange={e => setAutorNombre(e.target.value)}
                    placeholder="Tu nombre (opcional)"
                    style={{
                      width: '100%', padding: '8px 12px', marginBottom: 8,
                      border: `1px solid ${C.borderDark}`, borderRadius: 4,
                      fontSize: 13, background: C.bgWhite,
                    }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={nuevoComentario} onChange={e => setNuevoComentario(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && enviarComentario(sec.id)}
                      placeholder="Escribe un comentario..."
                      style={{
                        flex: 1, padding: '10px 12px',
                        border: `1px solid ${C.borderDark}`, borderRadius: 4,
                        fontSize: 14, background: C.bgWhite,
                      }} />
                    <button onClick={() => enviarComentario(sec.id)} style={{
                      padding: '10px 16px', background: C.ink, color: C.bg,
                      border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 500,
                    }}>Enviar</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {}
  return null;
}
