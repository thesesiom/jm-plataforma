'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Proyecto, Archivo, Video, SECCIONES } from '@/lib/types';
import { Nav } from '@/components/Nav';
import { C, F } from '@/lib/theme';
import {
  ArrowLeft, Upload, Trash2, Eye, Share2, QrCode, Save,
} from 'lucide-react';

export default function EditProyectoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (id) cargar();
  }, [id]);

  async function cargar() {
    setLoading(true);
    const [{ data: p }, { data: a }, { data: v }] = await Promise.all([
      supabase.from('proyectos').select('*').eq('id', id).single(),
      supabase.from('archivos').select('*').eq('proyecto_id', id).order('orden'),
      supabase.from('videos').select('*').eq('proyecto_id', id).order('creado_en'),
    ]);
    setProyecto(p);
    setArchivos(a || []);
    setVideos(v || []);
    setLoading(false);
  }

  async function guardar() {
    if (!proyecto) return;
    setGuardando(true);
    const { id: _, creado_en, actualizado_en, ...updates } = proyecto;
    const { error } = await supabase
      .from('proyectos')
      .update(updates)
      .eq('id', id);
    setGuardando(false);
    if (error) alert('Error al guardar: ' + error.message);
    else alert('Guardado ✓');
  }

  async function subirArchivo(seccion: string, file: File) {
    if (!proyecto) return;
    setUploadingSection(seccion);
    const ext = file.name.split('.').pop();
    const path = `${proyecto.id}/${seccion}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('proyectos')
      .upload(path, file);
    if (upErr) {
      alert('Error al subir: ' + upErr.message);
      setUploadingSection(null);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('proyectos')
      .getPublicUrl(path);

    const { error: dbErr } = await supabase.from('archivos').insert({
      proyecto_id: proyecto.id,
      seccion,
      nombre: file.name,
      tipo: file.type,
      tamano_bytes: file.size,
      url: urlData.publicUrl,
      storage_path: path,
    });
    if (dbErr) alert('Error al registrar: ' + dbErr.message);

    if ((seccion === 'photos' || seccion === 'renders') && !proyecto.cover_url) {
      await supabase.from('proyectos')
        .update({ cover_url: urlData.publicUrl })
        .eq('id', proyecto.id);
    }

    setUploadingSection(null);
    await cargar();
  }

  async function borrarArchivo(archivo: Archivo) {
    if (!confirm(`¿Borrar "${archivo.nombre}"?`)) return;
    if (archivo.storage_path) {
      await supabase.storage.from('proyectos').remove([archivo.storage_path]);
    }
    await supabase.from('archivos').delete().eq('id', archivo.id);
    await cargar();
  }

  async function agregarVideo() {
    const titulo = prompt('Título del video (ej: Recorrido virtual):');
    if (!titulo) return;
    const url = prompt('Pega el link de YouTube o Vimeo:');
    if (!url) return;
    let plataforma = 'youtube';
    if (url.includes('vimeo')) plataforma = 'vimeo';
    await supabase.from('videos').insert({
      proyecto_id: id, titulo, url, plataforma,
    });
    await cargar();
  }

  async function subirVideoMP4(file: File) {
    if (!proyecto) return;
    if (file.size > 50 * 1024 * 1024) {
      alert('El video pesa más de 50 MB. Considera comprimirlo o subirlo a YouTube.');
      return;
    }
    const titulo = prompt('Título del video:', file.name.replace(/\.[^.]+$/, ''));
    if (!titulo) return;

    setUploadingSection('video-mp4');
    const ext = file.name.split('.').pop();
    const path = `${proyecto.id}/videos/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('proyectos')
      .upload(path, file);
    if (upErr) {
      alert('Error al subir: ' + upErr.message);
      setUploadingSection(null);
      return;
    }
    const { data: urlData } = supabase.storage
      .from('proyectos')
      .getPublicUrl(path);

    await supabase.from('videos').insert({
      proyecto_id: id,
      titulo,
      url: urlData.publicUrl,
      plataforma: 'mp4',
    });
    setUploadingSection(null);
    await cargar();
  }

  async function borrarVideo(v: Video) {
    if (!confirm(`¿Borrar video "${v.titulo}"?`)) return;
    if (v.plataforma === 'mp4' && v.url.includes('/storage/')) {
      const match = v.url.match(/proyectos\/(.+)$/);
      if (match) {
        await supabase.storage.from('proyectos').remove([match[1]]);
      }
    }
    await supabase.from('videos').delete().eq('id', v.id);
    await cargar();
  }

  async function generarQR() {
    if (!proyecto) return;
    const QRCode = (await import('qrcode')).default;
    const url = `${window.location.origin}/p/${proyecto.slug}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
    setQrDataUrl(dataUrl);
    setQrOpen(true);
  }

  function copiarLink() {
    if (!proyecto) return;
    const url = `${window.location.origin}/p/${proyecto.slug}`;
    navigator.clipboard.writeText(url);
    alert('Link copiado ✓');
  }

  if (loading) return <><Nav showAdmin={false} /><p style={{ padding: 40 }}>Cargando...</p></>;
  if (!proyecto) return <><Nav showAdmin={false} /><p style={{ padding: 40 }}>Proyecto no encontrado.</p></>;

  return (
    <>
      <Nav showAdmin={false} />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
        <Link href="/admin" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: C.inkMuted, fontSize: 13, marginBottom: 20,
        }}>
          <ArrowLeft size={14} /> Volver a proyectos
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr', gap: 32 }}>
          <div>
            <div style={{
              fontSize: 11, color: C.accent, letterSpacing: '0.15em',
              textTransform: 'uppercase', marginBottom: 8, fontWeight: 600,
            }}>Editando</div>
            <h1 style={{
              fontFamily: F.display, fontSize: 36, fontWeight: 500,
              margin: '0 0 24px',
            }}>{proyecto.nombre}</h1>

            <section style={{ marginBottom: 32 }}>
              <h3 style={{
                fontSize: 14, fontWeight: 600, color: C.inkSubtle,
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12,
              }}>Datos generales</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  ['nombre', 'Nombre', 'text'],
                  ['cliente', 'Cliente', 'text'],
                  ['ubicacion', 'Ubicación', 'text'],
                  ['tipo', 'Tipología', 'text'],
                  ['anio', 'Año', 'number'],
                  ['superficie', 'Superficie', 'text'],
                  ['niveles', 'Niveles', 'text'],
                  ['tagline', 'Frase descriptiva', 'text'],
                  ['descripcion', 'Descripción', 'textarea'],
                  ['estado', 'Estado', 'select'],
                  ['avance', 'Avance (%)', 'number'],
                ].map(([key, label, tipo]) => (
                  <div key={key}>
                    <label style={{
                      fontSize: 12, color: C.inkSubtle, display: 'block', marginBottom: 4,
                    }}>{label}</label>
                    {tipo === 'textarea' ? (
                      <textarea
                        value={(proyecto as any)[key] ?? ''}
                        onChange={e => setProyecto({ ...proyecto, [key]: e.target.value })}
                        rows={4}
                        style={inputStyle}
                      />
                    ) : tipo === 'select' ? (
                      <select
                        value={proyecto.estado}
                        onChange={e => setProyecto({ ...proyecto, estado: e.target.value })}
                        style={inputStyle}
                      >
                        <option>En diseño</option>
                        <option>En ejecución</option>
                        <option>Terminado</option>
                        <option>Pausado</option>
                      </select>
                    ) : (
                      <input
                        type={tipo}
                        value={(proyecto as any)[key] ?? ''}
                        onChange={e => setProyecto({
                          ...proyecto,
                          [key]: tipo === 'number' ? parseInt(e.target.value) || 0 : e.target.value,
                        })}
                        style={inputStyle}
                      />
                    )}
                  </div>
                ))}
              </div>
              <button onClick={guardar} disabled={guardando} style={{
                marginTop: 16, display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 16px', background: C.ink, color: C.bg,
                border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 500,
              }}>
                <Save size={14} /> {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </section>

            <section style={{ marginBottom: 32 }}>
              <h3 style={{
                fontSize: 14, fontWeight: 600, color: C.inkSubtle,
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12,
              }}>Archivos por sección</h3>
              {SECCIONES.filter(s => s.id !== 'videos').map(sec => {
                const archivosSeccion = archivos.filter(a => a.seccion === sec.id);
                return (
                  <div key={sec.id} style={{
                    padding: 16, border: `1px solid ${C.border}`,
                    borderRadius: 4, marginBottom: 12, background: C.bgCard,
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: 12,
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{sec.label}</div>
                      <div style={{ fontSize: 12, color: C.inkSubtle }}>
                        {archivosSeccion.length} archivo{archivosSeccion.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {archivosSeccion.map(a => (
                      <div key={a.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '8px 0', borderBottom: `1px solid ${C.border}`,
                      }}>
                        <div style={{ flex: 1, fontSize: 13, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nombre}</div>
                        <a href={a.url} target="_blank" style={{
                          padding: '4px 8px', fontSize: 12, color: C.inkMuted,
                          border: `1px solid ${C.border}`, borderRadius: 3,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <Eye size={12} /> Ver
                        </a>
                        <button onClick={() => borrarArchivo(a)} style={{
                          padding: '4px 8px', fontSize: 12, color: '#a33',
                          background: 'transparent', border: `1px solid ${C.border}`,
                          borderRadius: 3, display: 'flex', alignItems: 'center',
                        }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <label style={{
                      display: 'block', marginTop: 8, padding: '10px 12px',
                      background: C.bgSoft, border: `1px dashed ${C.borderDark}`,
                      borderRadius: 4, fontSize: 13, cursor: 'pointer',
                      textAlign: 'center', color: C.ink,
                    }}>
                      {uploadingSection === sec.id ? (
                        <span>Subiendo...</span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                          <Upload size={14} /> Subir archivo
                        </span>
                      )}
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) subirArchivo(sec.id, f);
                          e.target.value = '';
                        }}
                        disabled={uploadingSection !== null}
                      />
                    </label>
                  </div>
                );
              })}
            </section>

            <section style={{ marginBottom: 32 }}>
              <h3 style={{
                fontSize: 14, fontWeight: 600, color: C.inkSubtle,
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12,
              }}>Videos (YouTube / Vimeo)</h3>
              <div style={{
                padding: 16, border: `1px solid ${C.border}`,
                borderRadius: 4, background: C.bgCard,
              }}>
                {videos.map(v => (
                  <div key={v.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '8px 0', borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{v.titulo}</div>
                      <div style={{ fontSize: 12, color: C.inkSubtle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.url}</div>
                    </div>
                    <button onClick={() => borrarVideo(v)} style={{
                      padding: '4px 8px', color: '#a33',
                      background: 'transparent', border: `1px solid ${C.border}`,
                      borderRadius: 3,
                    }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                  <button onClick={agregarVideo} style={{
                    padding: '10px 12px',
                    background: C.bgSoft, border: `1px dashed ${C.borderDark}`,
                    borderRadius: 4, fontSize: 13,
                  }}>
                    + YouTube / Vimeo
                  </button>
                  <label style={{
                    padding: '10px 12px', textAlign: 'center',
                    background: C.bgSoft, border: `1px dashed ${C.borderDark}`,
                    borderRadius: 4, fontSize: 13, cursor: 'pointer',
                  }}>
                    {uploadingSection === 'video-mp4' ? 'Subiendo...' : '+ Subir MP4'}
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) subirVideoMP4(f);
                        e.target.value = '';
                      }}
                      disabled={uploadingSection !== null}
                    />
                  </label>
                </div>
                <div style={{
                  marginTop: 8, fontSize: 11, color: C.inkSubtle, textAlign: 'center',
                }}>
                  MP4 hasta 50 MB. Videos largos: usa YouTube no listado.
                </div>
              </div>
            </section>
          </div>

          <aside>
            <div style={panelStyle}>
              <h3 style={panelTitleStyle}>Compartir con cliente</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input readOnly value={`/p/${proyecto.slug}`} style={{
                  ...inputStyle, fontSize: 12, background: C.bgSoft, color: C.inkMuted,
                }} />
                <button onClick={copiarLink} style={{
                  padding: '10px 12px', background: C.ink, color: C.bg,
                  border: 'none', borderRadius: 4,
                }}>
                  <Share2 size={14} />
                </button>
              </div>
              <button onClick={generarQR} style={{
                width: '100%', padding: '10px 12px',
                background: 'transparent', border: `1px solid ${C.borderDark}`,
                borderRadius: 4, fontSize: 13, display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <QrCode size={14} /> Generar QR
              </button>
              {qrOpen && qrDataUrl && (
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                  <img src={qrDataUrl} alt="QR" style={{ width: '100%', maxWidth: 200 }} />
                  <div style={{ fontSize: 11, color: C.inkSubtle, marginTop: 4 }}>
                    Escanea para ver el proyecto
                  </div>
                  <a href={qrDataUrl} download={`qr-${proyecto.slug}.png`} style={{
                    display: 'inline-block', marginTop: 8, fontSize: 12, color: C.accent,
                  }}>
                    Descargar QR
                  </a>
                </div>
              )}
            </div>

            <div style={panelStyle}>
              <h3 style={panelTitleStyle}>Permisos</h3>
              <ToggleRow
                label="Permitir descargas"
                desc="El cliente puede bajar los archivos"
                value={proyecto.descargas_habilitadas}
                onChange={v => setProyecto({ ...proyecto, descargas_habilitadas: v })}
              />
              <ToggleRow
                label="Publicar en portafolio"
                desc="Visible en la página pública"
                value={proyecto.publicado_portafolio}
                onChange={v => setProyecto({ ...proyecto, publicado_portafolio: v })}
              />
              <ToggleRow
                label="Archivado"
                desc="Proyecto terminado, no edita más"
                value={proyecto.archivado}
                onChange={v => setProyecto({ ...proyecto, archivado: v })}
              />
              <button onClick={guardar} style={{
                width: '100%', marginTop: 12, padding: '10px 12px',
                background: C.ink, color: C.bg, border: 'none',
                borderRadius: 4, fontSize: 13, fontWeight: 500,
              }}>
                Guardar permisos
              </button>
            </div>

            <div style={panelStyle}>
              <h3 style={panelTitleStyle}>Acciones</h3>
              <Link href={`/p/${proyecto.slug}`} target="_blank" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px', marginBottom: 8,
                background: C.bgSoft, border: `1px solid ${C.border}`,
                borderRadius: 4, fontSize: 13,
              }}>
                <Eye size={14} /> Ver como cliente
              </Link>
              <button onClick={async () => {
                if (!confirm('¿Borrar este proyecto permanentemente? Se perderán todos los archivos.')) return;
                await supabase.from('proyectos').delete().eq('id', id);
                router.push('/admin');
              }} style={{
                width: '100%', padding: '10px 12px',
                background: 'transparent', color: '#a33',
                border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 13,
              }}>
                <Trash2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                Borrar proyecto
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  border: `1px solid ${C.borderDark}`, borderRadius: 4,
  fontSize: 14, background: C.bgWhite, color: C.ink,
};

const panelStyle: React.CSSProperties = {
  background: C.bgCard, border: `1px solid ${C.border}`,
  padding: 20, borderRadius: 4, marginBottom: 16,
};

const panelTitleStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: C.inkSubtle,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  marginTop: 0, marginBottom: 16,
};

function ToggleRow({ label, desc, value, onChange }: {
  label: string; desc: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      gap: 12, padding: '10px 0',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 11, color: C.inkMuted }}>{desc}</div>
      </div>
      <button onClick={() => onChange(!value)} style={{
        width: 36, height: 20, borderRadius: 10,
        background: value ? C.accent : C.border,
        border: 'none', position: 'relative', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: 'white', transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );
}
