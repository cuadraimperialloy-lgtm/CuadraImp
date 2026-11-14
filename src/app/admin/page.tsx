import React from 'react';
import type { Metadata } from 'next';
import { readDatabase } from '@/lib/db';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'CMS Administrativo · Cuadra Imperial Loy',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  const db = readDatabase();
  return <AdminDashboard initialDb={db} />;
}

