import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

export async function GET() {
  try {
    const res = await query(
      `SELECT id, user_id, username, display_name, avatar_url, user_role, message, created_at 
       FROM community_messages 
       WHERE deleted_at IS NULL 
       ORDER BY created_at ASC 
       LIMIT 150`
    );

    const messages = res.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      username: r.username,
      displayName: r.display_name,
      avatarUrl: r.avatar_url,
      userRole: r.user_role,
      message: r.message,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error('Fetch community messages error:', error);
    return NextResponse.json({ error: 'Gagal mengambil pesan komunitas.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, message } = await req.json();

    if (!userId || !message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong.' }, { status: 400 });
    }

    const trimmedMsg = message.trim();
    if (trimmedMsg.length > 2000) {
      return NextResponse.json({ error: 'Pesan maksimal 2000 karakter.' }, { status: 400 });
    }

    // Fetch genuine user details from DB
    const userRes = await query(
      'SELECT id, username, display_name, avatar_url, role, status FROM users WHERE id = $1 OR username = $1',
      [userId]
    );

    let sender = userRes.rows[0];
    if (!sender && userId === 'usr-superadmin-static') {
      sender = {
        id: 'usr-superadmin-static',
        username: 'silsilah',
        display_name: 'Superadmin SILSILAH',
        avatar_url: null,
        role: 'superadmin',
        status: 'active',
      };
    }

    if (!sender || sender.status === 'deactivated') {
      return NextResponse.json({ error: 'Akun pengirim tidak valid atau dinonaktifkan.' }, { status: 403 });
    }

    const msgId = `cmsg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    await query(
      `INSERT INTO community_messages (id, user_id, username, display_name, avatar_url, user_role, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        msgId,
        sender.id,
        sender.username,
        sender.display_name,
        sender.avatar_url || null,
        sender.role,
        trimmedMsg,
      ]
    );

    return NextResponse.json({
      success: true,
      message: {
        id: msgId,
        userId: sender.id,
        username: sender.username,
        displayName: sender.display_name,
        avatarUrl: sender.avatar_url,
        userRole: sender.role,
        message: trimmedMsg,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Send community message error:', error);
    return NextResponse.json({ error: 'Gagal mengirim pesan komunitas.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = req.nextUrl;
    let messageId = url.searchParams.get('id');
    let actorUserId = url.searchParams.get('actorUserId');

    if (!messageId || !actorUserId) {
      try {
        const body = await req.json();
        messageId = messageId || body.id || body.messageId;
        actorUserId = actorUserId || body.actorUserId;
      } catch {}
    }

    if (!messageId || !actorUserId) {
      return NextResponse.json({ error: 'ID pesan dan identitas pengguna diperlukan.' }, { status: 400 });
    }

    // Fetch target message
    const msgRes = await query('SELECT * FROM community_messages WHERE id = $1 AND deleted_at IS NULL', [messageId]);
    if (msgRes.rows.length === 0) {
      return NextResponse.json({ error: 'Pesan tidak ditemukan atau sudah dihapus.' }, { status: 404 });
    }
    const targetMsg = msgRes.rows[0];

    // Fetch actor
    const actorRes = await query('SELECT id, username, role FROM users WHERE id = $1 OR username = $1', [actorUserId]);
    let actor = actorRes.rows[0];
    if (!actor && actorUserId === 'usr-superadmin-static') {
      actor = { id: 'usr-superadmin-static', username: 'silsilah', role: 'superadmin' };
    }

    if (!actor) {
      return NextResponse.json({ error: 'Pengguna tidak valid.' }, { status: 401 });
    }

    const isAuthor = actor.id === targetMsg.user_id || actor.username === targetMsg.username;
    const isSuperadmin = actor.role === 'superadmin' || actor.username === 'silsilah';
    const isAdmin = actor.role === 'admin';

    // Hierarchical unsend / delete rule:
    // 1. Author can always delete their own message (unsend)
    // 2. Superadmin can delete any message (admin & user)
    // 3. Admin can delete messages from user (client/user), but NOT from superadmin or other admins
    let allowed = false;
    if (isAuthor) {
      allowed = true;
    } else if (isSuperadmin) {
      allowed = true;
    } else if (isAdmin) {
      const targetAuthorRole = targetMsg.user_role;
      if (targetAuthorRole === 'client' || targetAuthorRole === 'user') {
        allowed = true;
      }
    }

    if (!allowed) {
      return NextResponse.json(
        { error: 'Akses ditolak: Anda tidak memiliki wewenang untuk menghapus pesan ini.' },
        { status: 403 }
      );
    }

    await query('UPDATE community_messages SET deleted_at = NOW() WHERE id = $1', [messageId]);

    return NextResponse.json({ success: true, messageId });
  } catch (error: any) {
    console.error('Delete community message error:', error);
    return NextResponse.json({ error: 'Gagal menghapus pesan komunitas.' }, { status: 500 });
  }
}
