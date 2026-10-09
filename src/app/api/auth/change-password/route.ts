import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { userId, oldPassword, newPassword } = await req.json();

    if (!userId || !oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Seluruh kolom kata sandi wajib diisi.' }, { status: 400 });
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ error: 'Kata sandi baru minimal 4 karakter.' }, { status: 400 });
    }

    const res = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    const user = res.rows[0];

    // Validate old password
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Kata sandi lama tidak cocok.' }, { status: 400 });
    }

    // Hash and update
    const newHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);

    return NextResponse.json({ success: true, message: 'Kata sandi berhasil diperbarui.' });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui kata sandi.' }, { status: 500 });
  }
}
