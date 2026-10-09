import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

export async function GET() {
  try {
    const res = await query(
      'SELECT id, username, display_name, role, status, created_at FROM users ORDER BY created_at ASC'
    );
    const users = res.rows.map((r) => ({
      id: r.id,
      username: r.username,
      displayName: r.display_name,
      role: r.role,
      status: r.status,
      createdAt: r.created_at,
    }));
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pengguna.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { actorUserId, targetUserId, newRole, newStatus } = await req.json();

    // Verify actor is superadmin
    const actorRes = await query("SELECT role FROM users WHERE id = $1 AND role = 'superadmin'", [actorUserId]);
    if (actorRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Superadmin yang berwenang mengubah role atau status akun.' },
        { status: 403 }
      );
    }

    const targetRes = await query('SELECT * FROM users WHERE id = $1', [targetUserId]);
    if (targetRes.rows.length === 0) {
      return NextResponse.json({ error: 'Akun target tidak ditemukan.' }, { status: 404 });
    }

    const targetUser = targetRes.rows[0];

    // PROTECTION 1: Static Superadmin "silsilah" cannot be demoted or deactivated
    if (targetUser.username === 'silsilah') {
      if (newRole && newRole !== 'superadmin') {
        return NextResponse.json(
          { error: 'Superadmin "silsilah" adalah akun statis dan tidak dapat diubah rolenya.' },
          { status: 400 }
        );
      }
      if (newStatus === 'deactivated') {
        return NextResponse.json(
          { error: 'Superadmin "silsilah" tidak dapat dinonaktifkan.' },
          { status: 400 }
        );
      }
    }

    // PROTECTION 2: Only 1 Superadmin is allowed in the entire system
    if (newRole === 'superadmin' && targetUser.username !== 'silsilah') {
      return NextResponse.json(
        { error: 'Hanya boleh ada 1 Superadmin statis di dalam sistem (akun: silsilah).' },
        { status: 400 }
      );
    }

    // Apply updates
    if (newRole) {
      await query('UPDATE users SET role = $1 WHERE id = $2', [newRole, targetUserId]);
    }
    if (newStatus) {
      await query('UPDATE users SET status = $1 WHERE id = $2', [newStatus, targetUserId]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui pengguna.' }, { status: 500 });
  }
}
