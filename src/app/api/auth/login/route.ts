import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi.' }, { status: 400 });
    }

    const trimmedUser = username.trim().toLowerCase();
    const res = await query('SELECT * FROM users WHERE LOWER(username) = $1', [trimmedUser]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 401 });
    }

    const user = res.rows[0];

    if (user.status === 'deactivated') {
      return NextResponse.json(
        { error: 'Akun Anda dinonaktifkan oleh Superadmin. Silakan hubungi pengelola.' },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Kata sandi salah.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        role: user.role,
        status: user.status,
        createdAt: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server database.' }, { status: 500 });
  }
}
