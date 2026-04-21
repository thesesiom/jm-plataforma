'use client';
import { Video } from '@/lib/types';
import { C } from '@/lib/theme';

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

export function VideoPlayer({ video }: { video: Video }) {
  const esMP4 = video.plataforma === 'mp4' || /\.(mp4|webm|mov)$/i.test(video.url);
  const embed = esMP4 ? null : toEmbedUrl(video.url);

  if (esMP4) {
    return (
      <video
        src={video.url}
        controls
        playsInline
        preload="metadata"
        style={{
          width: '100%',
          maxHeight: '70vh',
          background: '#000',
          display: 'block',
          borderRadius: 4,
        }}
      />
    );
  }

  if (embed) {
    return (
      <div style={{
        position: 'relative',
        paddingBottom: '56.25%',
        height: 0,
        background: '#000',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <iframe
          src={embed}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            border: 0,
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <a href={video.url} target="_blank" rel="noopener" style={{
      display: 'inline-block',
      padding: '12px 16px',
      background: C.bgSoft,
      border: `1px solid ${C.border}`,
      borderRadius: 4,
      color: C.accent,
      fontSize: 14,
    }}>
      Abrir video externo →
    </a>
  );
}
