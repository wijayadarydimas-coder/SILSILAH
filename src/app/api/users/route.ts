import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const res = await query(
      'SELECT id, username, display_name, email, phone, avatar_url, role, status, created_at FROM users ORDER BY created_at ASC'
    );
    const users = res.rows.map((r) => ({
      id: r.id,
      username: r.username,
      displayName: r.display_name,
      email: r.email,
      phone: r.phone,
      avatarUrl: r.avatar_url,
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

export async function POST(req: NextRequest) {
  try {
    const { actorUserId, username, password, displayName, email, phone, role } = await req.json();

    // Verify actor is Superadmin
    const actorRes = await query(
      "SELECT id, role, username FROM users WHERE id = $1 OR username = $1",
      [actorUserId || 'usr-superadmin']
    );
    const actor = actorRes.rows[0];
    const isSuperadmin =
      (actor && (actor.role === 'superadmin' || actor.username === 'silsilah')) ||
      actorUserId === 'usr-superadmin-static';

    if (!isSuperadmin) {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Superadmin yang berwenang membuat akun login baru.' },
        { status: 403 }
      );
    }

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi.' }, { status: 400 });
    }

    const trimmedUser = username.trim().toLowerCase();

    // Disallow using or overwriting the static superadmin username
    if (trimmedUser === 'silsilah') {
      return NextResponse.json(
        { error: 'Username "silsilah" adalah Superadmin statis yang dilindungi.' },
        { status: 400 }
      );
    }

    if (trimmedUser.length < 3) {
      return NextResponse.json({ error: 'Username minimal 3 karakter.' }, { status: 400 });
    }

    // Only allow alphanumeric, underscore, dot, dash
    if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedUser)) {
      return NextResponse.json(
        { error: 'Username hanya boleh berisi huruf, angka, garis bawah (_), titik (.), atau tanda hubung (-).' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Password minimal 4 karakter.' }, { status: 400 });
    }

    // Check if username already taken
    const existing = await query('SELECT id FROM users WHERE LOWER(username) = $1', [trimmedUser]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: `Username "${trimmedUser}" sudah digunakan. Silakan pilih username lain.` },
        { status: 400 }
      );
    }

    const trimmedEmail = email?.trim()?.toLowerCase() || null;
    const trimmedPhone = phone?.trim() || null;
    const finalDisplayName = displayName?.trim() || username.trim();
    const assignedRole = role === 'admin' ? 'admin' : 'client';

    const passwordHash = await bcrypt.hash(password, 10);
    const newId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const insertRes = await query(
      `INSERT INTO users (id, username, display_name, email, phone, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
       RETURNING id, username, display_name, email, phone, role, status, created_at`,
      [newId, trimmedUser, finalDisplayName, trimmedEmail, trimmedPhone, passwordHash, assignedRole]
    );

    const newUser = insertRes.rows[0];

    // Log to PostgreSQL audit log (non-blocking)
    try {
      const wsRes = await query('SELECT id FROM workspaces LIMIT 1');
      const wsId = wsRes.rows[0]?.id;
      if (wsId) {
        const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        await query(
          `INSERT INTO audit_logs (id, workspace_id, actor_user_id, actor_name, actor_role, action, target_type, target_id, timestamp, summary)
           VALUES ($1, $2, $3, $4, 'superadmin', 'CREATE_USER', 'user', $5, NOW(), $6)`,
          [
            logId,
            wsId,
            actor?.id || 'usr-superadmin-static',
            actor?.display_name || 'Superadmin SILSILAH',
            newUser.id,
            `Superadmin membuat akun baru: ${newUser.display_name} (@${newUser.username}) dengan hak akses ${assignedRole === 'admin' ? 'Admin' : 'User'}.`,
          ]
        );
      }
    } catch (auditErr) {
      console.warn('Non-blocking audit log creation error:', auditErr);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.display_name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.created_at,
      },
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Gagal membuat akun ke database PostgreSQL.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { actorUserId, targetUserId, newRole, newStatus, avatarUrl, displayName, email, phone, newPassword } = await req.json();

    const actorRes = await query(
      "SELECT id, role, username FROM users WHERE id = $1 OR username = $1",
      [actorUserId]
    );
    if (actorRes.rows.length === 0 && actorUserId !== 'usr-superadmin-static') {
      return NextResponse.json({ error: 'Pengguna tidak valid.' }, { status: 401 });
    }

    const actor = actorRes.rows[0] || { id: 'usr-superadmin-static', role: 'superadmin', username: 'silsilah' };

    const targetRes = await query('SELECT * FROM users WHERE id = $1 OR username = $1', [targetUserId]);
    if (targetRes.rows.length === 0) {
      return NextResponse.json({ error: 'Akun target tidak ditemukan.' }, { status: 404 });
    }

    const targetUser = targetRes.rows[0];

    // Profile updates (avatar, displayName, email, phone): allowed for self or superadmin
    const isSelf = actor.id === targetUser.id || actor.username === targetUser.username;
    const isSuperadmin = actor.role === 'superadmin' || actor.username === 'silsilah';

    if (avatarUrl !== undefined || displayName || email !== undefined || phone !== undefined) {
      if (!isSelf && !isSuperadmin) {
        return NextResponse.json(
          { error: 'Akses ditolak: Anda hanya dapat mengubah profil akun Anda sendiri.' },
          { status: 403 }
        );
      }

      if (avatarUrl !== undefined) {
        await query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, targetUser.id]);
      }
      if (displayName) {
        await query('UPDATE users SET display_name = $1 WHERE id = $2', [displayName, targetUser.id]);
      }
      if (email !== undefined) {
        await query('UPDATE users SET email = $1 WHERE id = $2', [email, targetUser.id]);
      }
      if (phone !== undefined) {
        await query('UPDATE users SET phone = $1 WHERE id = $2', [phone, targetUser.id]);
      }
    }

    // Role or Status changes: only allowed for superadmin
    if (newRole || newStatus) {
      if (!isSuperadmin) {
        return NextResponse.json(
          { error: 'Akses ditolak: Hanya Superadmin yang berwenang mengubah role atau status akun.' },
          { status: 403 }
        );
      }

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

      if (newRole) {
        await query('UPDATE users SET role = $1 WHERE id = $2', [newRole, targetUser.id]);
      }
      if (newStatus) {
        await query('UPDATE users SET status = $1 WHERE id = $2', [newStatus, targetUser.id]);
      }
    }

    // Password reset: allowed for superadmin
    if (newPassword) {
      if (!isSuperadmin) {
        return NextResponse.json(
          { error: 'Akses ditolak: Hanya Superadmin yang berwenang mengubah password pengguna lain.' },
          { status: 403 }
        );
      }
      if (newPassword.length < 4) {
        return NextResponse.json(
          { error: 'Password baru minimal 4 karakter.' },
          { status: 400 }
        );
      }
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, targetUser.id]);

      // Audit log (non-blocking)
      try {
        const wsRes = await query('SELECT id FROM workspaces LIMIT 1');
        const wsId = wsRes.rows[0]?.id;
        if (wsId) {
          const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          await query(
            `INSERT INTO audit_logs (id, workspace_id, actor_user_id, actor_name, actor_role, action, target_type, target_id, timestamp, summary)
             VALUES ($1, $2, $3, $4, 'superadmin', 'RESET_USER_PASSWORD', 'user', $5, NOW(), $6)`,
            [
              logId,
              wsId,
              actor.id,
              actor.display_name || 'Superadmin SILSILAH',
              targetUser.id,
              `Superadmin mengatur ulang kata sandi (password) untuk akun: ${targetUser.display_name} (@${targetUser.username}).`,
            ]
          );
        }
      } catch (auditErr) {
        console.warn('Non-blocking audit log password reset error:', auditErr);
      }
    }

    // Return updated user
    const updatedRes = await query(
      'SELECT id, username, display_name, email, phone, avatar_url, role, status, created_at FROM users WHERE id = $1',
      [targetUser.id]
    );
    const updated = updatedRes.rows[0];

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        username: updated.username,
        displayName: updated.display_name,
        email: updated.email,
        phone: updated.phone,
        avatarUrl: updated.avatar_url,
        role: updated.role,
        status: updated.status,
        createdAt: updated.created_at,
      },
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui pengguna.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = req.nextUrl;
    let targetUserId = url.searchParams.get('id') || url.searchParams.get('userId') || url.searchParams.get('targetUserId');
    let actorUserId = url.searchParams.get('actorUserId');

    if (!targetUserId || !actorUserId) {
      const body = await req.json().catch(() => ({}));
      targetUserId = targetUserId || body.targetUserId || body.id;
      actorUserId = actorUserId || body.actorUserId;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'ID akun target wajib disertakan.' }, { status: 400 });
    }

    // Verify actor is superadmin
    const actorRes = await query(
      "SELECT id, role, username FROM users WHERE (id = $1 OR username = $1 OR username = 'silsilah') AND role = 'superadmin'",
      [actorUserId || 'usr-superadmin']
    );
    if (actorRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Superadmin yang berwenang menghapus akun.' },
        { status: 403 }
      );
    }

    const targetRes = await query('SELECT * FROM users WHERE id = $1 OR username = $1', [targetUserId]);
    if (targetRes.rows.length === 0) {
      return NextResponse.json({ error: 'Akun yang akan dihapus tidak ditemukan.' }, { status: 404 });
    }

    const targetUser = targetRes.rows[0];

    // Protection: Cannot delete superadmin
    if (targetUser.role === 'superadmin' || targetUser.username === 'silsilah') {
      return NextResponse.json({ error: 'Akun Superadmin tidak dapat dihapus.' }, { status: 400 });
    }

    // Unlink any person attached to this user
    await query('UPDATE people SET linked_user_id = NULL WHERE linked_user_id = $1', [targetUser.id]);

    // Delete password reset requests related to this user
    await query('DELETE FROM password_reset_requests WHERE user_id = $1', [targetUser.id]);

    // Delete user from PostgreSQL
    await query('DELETE FROM users WHERE id = $1', [targetUser.id]);

    return NextResponse.json({ success: true, deletedUserId: targetUser.id });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Gagal menghapus akun pengguna.' }, { status: 500 });
  }
}

