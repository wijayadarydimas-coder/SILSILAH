import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SILSILAH - Aplikasi Silsilah Keluarga Interaktif',
  description:
    'Dokumentasi silsilah keluarga interaktif dengan kanvas pohon React Flow, sistem hak akses multi-role (Superadmin, Admin, Client), dan privasi data.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
