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
      <div className="nav-inner">
        <Link href="/" style={{ textDecoration: 'none', minWidth: 0 }}>
          <Logo size="md" responsiveText />
        </Link>
        <div className="nav-links">
          <Link href="/portafolio" className="nav-link-plain">
            Portafolio
          </Link>
          {showAdmin && (
            <Link href="/admin" className="nav-link-admin">
              <Settings size={14} />
              <span className="nav-admin-label">Admin</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
