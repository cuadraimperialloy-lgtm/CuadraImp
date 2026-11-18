import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { readDatabase } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Panel Administrativo · Cuadra Imperial Loy',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PanelPage() {
  const db = readDatabase();
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  const initialAuthenticated = token ? verifySessionToken(token) : false;

  return (
    <AdminDashboard
      initialDb={db}
      initialAuthenticated={initialAuthenticated}
    />
  );
}
