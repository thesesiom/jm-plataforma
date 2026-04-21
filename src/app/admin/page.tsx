'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Proyecto } from '@/lib/types';
import { Nav } from '@/components/Nav';
import { C, F } from '@/lib/theme';
import { Plus, Edit, Lock, Unlock } from 'lucide-react';

export default function AdminPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [creando, setCreando] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');

  useEffect(() => {
    cargarProyectos();
  }, []);

  async function cargarProyectos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('proyectos')
      .select('*')
      .order('creado_en', { ascending: false });
    if (!error && data) setProyectos(data);
    setLoading(false);
  }

  async function crearProyecto() {
    const nombre = prompt('Nombre del proyecto:');
    if (!nombre) return;
    const slug = nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Math.random().toString(36).substring(2, 6);

    setCreando(true);
    const { data, error } = await supabase
      .from('proyectos')
      .insert({
        nombre,
        slug,
        estado: 'En diseño',
        avance: 0,
        anio: new Date().getFullYear(),
      })
      .select()
      .single();
    setCreando(false);
    if (error) {
      alert('Error al crear proyecto: ' + error.message);
      return;
    }
    if (data) {
      window.location.href = `/admin/${data.id}`;
    }
  }

  const filtered = proyectos.filter(p => {
    if (filter === 'active') return !p.archivado;
    if (filter === 'archived') return p.archivado;
    return true;
  });

  return (
    <>
      <Nav showAdmin={false} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16, marginBottom: 32,
        }}>
          <div>
            <div style={{
              fontSize: 11, color: C.accent, letterSpacing: '0.15em',
              textTransform: 'uppercase', marginBottom: 8, fontWeight: 600,
            }}>Panel de administración</div>
            <h1 style={{
              fontFamily: F.display, fontSize: 40, fontWeight: 500,
              margin: 0, letterSpacing: '-0.02em',
            }}>Mis proyectos</h1>
          </div>
          <button onClick={crearProyecto} disabled={creando} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 20px', background: C.ink, color: C.bg,
            border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500,
            opacity: creando ? 0.5 : 1,
          }}>
            <Plus size={16} /> {creando ? 'Creando...' : 'Nuevo proyecto'}
          </button>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16, marginBottom: 32,
        }}>
          {[
            ['Total', proyectos.length],
            ['Activos', proyectos.filter(p => !p.archivado).length],
            ['En portafolio', proyectos.filter(p => p.publicado_portafolio).length],
          ].map(([k, v]) => (
            <div key={k} style={{
              background: C.bgCard, border: `1px solid ${C.border}`,
              padding: 20, borderRadius: 4,
            }}>
              <div style={{ fontSize: 12, color: C.inkSubtle, marginBottom: 6 }}>{k}</div>
              <div style={{ fontFamily: F.display, fontSize: 32, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {([['all', 'Todos'], ['active', 'Activos'], ['archived', 'Archivados']] as const).map(
            ([v, l]) => (
              <button key={v} onClick={() => setFilter(v)} style={{
                padding: '6px 12px', fontSize: 13,
                background: filter === v ? C.ink : 'transparent',
                color: filter === v ? C.bg : C.inkMuted,
                border: `1px solid ${filter === v ? C.ink : C.border}`,
                borderRadius: 999,
              }}>{l}</button>
            )
          )}
        </div>

        {loading && <p style={{ color: C.inkMuted }}>Cargando...</p>}

        {!loading && filtered.length === 0 && (
          <div style={{
            padding: 60, textAlign: 'center',
            background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4,
          }}>
            <p style={{ color: C.inkMuted, margin: 0 }}>
              No hay proyectos todavía. Empieza creando uno.
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{
            background: C.bgCard, border: `1px solid ${C.border}`,
            borderRadius: 4, overflow: 'hidden',
          }}>
            {filtered.map((p, i) => (
              <div key={p.id} style={{
                display: 'grid',
                gridTemplateColumns: '64px minmax(0, 2fr) 1fr 1fr auto',
                gap: 16, alignItems: 'center', padding: 16,
                borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{
                  width: 64, height: 64,
                  background: p.cover_url
                    ? `url(${p.cover_url}) center/cover`
                    : C.bgSoft,
                  borderRadius: 4,
                }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                    {p.nombre}
                  </div>
                  <div style={{ fontSize: 13, color: C.inkMuted }}>
                    {p.cliente || 'Sin cliente'} · {p.ubicacion || 'Sin ubicación'}
                  </div>
                </div>
                <div>
                  <div style={{
                    display: 'inline-block', padding: '3px 8px',
                    background: p.archivado ? C.bgSoft : C.bgGold,
                    color: p.archivado ? C.inkMuted : C.accent,
                    fontSize: 11, fontWeight: 600, borderRadius: 3,
                  }}>{p.archivado ? 'Archivado' : p.estado}</div>
                </div>
                <div style={{ fontSize: 13, color: C.inkMuted }}>
                  {p.descargas_habilitadas ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Unlock size={12} /> Descargas
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Lock size={12} /> Solo ver
                    </span>
                  )}
                </div>
                <Link href={`/admin/${p.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '8px 12px', background: 'transparent',
                  border: `1px solid ${C.border}`, borderRadius: 4,
                  fontSize: 13,
                }}>
                  <Edit size={13} /> Abrir
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
