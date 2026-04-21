'use client';
import Link from 'next/link';
import { Logo } from './Logo';
import { C } from '@/lib/theme';
import { Settings } from 'lucide-react';

export function Nav({ showAdmin = true }: { showAdmin?: boolean }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(244, 248, 252, 0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12,
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo size="md" />
        </Link>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/portafolio" style={{
            fontSize: 13, color: C.inkMuted, padding: '8px 12px',
          }}>Portafolio</Link>
          {showAdmin && (
            <Link href="/admin" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: C.ink, padding: '8px 14px',
              background: C.bgCard, border: `1px solid ${C.border}`,
              borderRadius: 4,
            }}>
              <Settings size={14} /> Admin
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
