import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { username, password, displayName } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi.' }, { status: 400 });
    }

    const trimmedUser = username.trim().toLowerCase();

    // Prevent impersonating the static superadmin
    if (trimmedUser === 'silsilah') {
      return NextResponse.json(
        { error: 'Username "silsilah" adalah Superadmin statis yang dilindungi.' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Password minimal 4 karakter.' }, { status: 400 });
    }

    // Check if username already exists
    const existing = await query('SELECT id FROM users WHERE LOWER(username) = $1', [trimmedUser]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Username sudah digunakan, silakan pilih yang lain.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const finalDisplayName = displayName?.trim() || username.trim();

    // All new registrations are strictly CLIENT
    const insertRes = await query(
      `INSERT INTO users (id, username, display_name, password_hash, role, status)
       VALUES ($1, $2, $3, $4, 'client', 'active')
       RETURNING id, username, display_name, role, status, created_at`,
      [newId, trimmedUser, finalDisplayName, passwordHash]
    );

    const newUser = insertRes.rows[0];

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.display_name,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.created_at,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Gagal mendaftar ke database.' }, { status: 500 });
  }
}
