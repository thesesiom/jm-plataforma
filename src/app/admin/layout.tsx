'use client';
import { LoginGate } from '@/components/LoginGate';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <LoginGate>{children}</LoginGate>;
}
