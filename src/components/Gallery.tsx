'use client';
import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { C } from '@/lib/theme';

type GalleryProps = {
  images: { id: string; url: string; nombre?: string }[];
  columns?: number;
};

export function Gallery({ images, columns }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const close = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(() => {
    setLightboxIndex(i => {
      if (i === null) return null;
      return i === 0 ? images.length - 1 : i - 1;
    });
  }, [images.length]);
  const next = useCallback(() => {
    setLightboxIndex(i => {
      if (i === null) return null;
      return i === images.length - 1 ? 0 : i + 1;
    });
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, close, prev, next]);

  if (images.length === 0) return null;

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: columns
          ? `repeat(${columns}, minmax(0, 1fr))`
          : 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setLightboxIndex(i)}
            style={{
              padding: 0, border: 'none', background: C.bgSoft,
              cursor: 'zoom-in', overflow: 'hidden',
              display: 'block', width: '100%',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={e => {
              const child = e.currentTarget.querySelector('img');
              if (child) child.style.transform = 'scale(1.03)';
            }}
            onMouseLeave={e => {
              const child = e.currentTarget.querySelector('img');
              if (child) child.style.transform = 'scale(1)';
            }}
          >
            <img
              src={img.url}
              alt={img.nombre || ''}
              loading="lazy"
              style={{
                width: '100%', height: 'auto', display: 'block',
                transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(14, 42, 68, 0.96)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 40,
          }}
        >
          <button
            onClick={close}
            aria-label="Cerrar"
            style={{
              position: 'absolute', top: 20, right: 20,
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <X size={20} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev(); }}
                aria-label="Anterior"
                style={{
                  position: 'absolute', left: 20, top: '50%',
                  transform: 'translateY(-50%)',
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); next(); }}
                aria-label="Siguiente"
                style={{
                  position: 'absolute', right: 20, top: '50%',
                  transform: 'translateY(-50%)',
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <img
            src={images[lightboxIndex].url}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '95vw', maxHeight: '90vh',
              objectFit: 'contain', display: 'block',
              cursor: 'default',
            }}
          />

          <div style={{
            position: 'absolute', bottom: 20, left: 0, right: 0,
            textAlign: 'center', color: 'rgba(255,255,255,0.7)',
            fontSize: 13, letterSpacing: '0.05em',
          }}>
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
