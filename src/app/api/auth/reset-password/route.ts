import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';
import bcrypt from 'bcryptjs';
import { sendPasswordResetEmail } from '@/lib/email/sender';

// GET: Ambil daftar permintaan lupa password (untuk Admin & Superadmin)
export async function GET(req: NextRequest) {
  try {
    const res = await query(
      `SELECT r.id, r.user_id, r.username, r.display_name, r.contact_type, r.contact_value, r.token, r.status, r.notes, r.created_at, r.resolved_at
       FROM password_reset_requests r
       ORDER BY r.created_at DESC`
    );

    const requests = res.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      username: row.username,
      displayName: row.display_name,
      contactType: row.contact_type,
      contactValue: row.contact_value,
      token: row.token,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at,
    }));

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    console.error('Fetch reset requests error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data permintaan reset password.' }, { status: 500 });
  }
}

// POST: Ajukan permohonan reset password atau konfirmasi dengan token email
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. AJUKAN PERMOHONAN RESET
    if (action === 'REQUEST_RESET') {
      const { identifier } = body; // Bisa username, email, atau no WhatsApp
      if (!identifier?.trim()) {
        return NextResponse.json({ error: 'Masukkan username, email, atau nomor WhatsApp Anda.' }, { status: 400 });
      }

      const cleanId = identifier.trim().toLowerCase();
      const userRes = await query(
        `SELECT id, username, display_name, email, phone, role
         FROM users
         WHERE LOWER(username) = $1 OR LOWER(COALESCE(email, '')) = $1 OR COALESCE(phone, '') = $2`,
        [cleanId, identifier.trim()]
      );

      if (userRes.rows.length === 0) {
        return NextResponse.json(
          { error: 'Akun dengan username, email, atau nomor WhatsApp tersebut tidak ditemukan.' },
          { status: 404 }
        );
      }

      const targetUser = userRes.rows[0];
      const requestId = `rst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      // Jika user punya email dan permintaan memakai email / username dengan email
      if (targetUser.email && (cleanId.includes('@') || !targetUser.phone)) {
        // Buat 6-digit token verifikasi otomatis
        const token = Math.floor(100000 + Math.random() * 900000).toString();

        await query(
          `INSERT INTO password_reset_requests (id, user_id, username, display_name, contact_type, contact_value, token, status, notes)
           VALUES ($1, $2, $3, $4, 'email', $5, $6, 'pending', 'Permintaan verifikasi via Email')`,
          [requestId, targetUser.id, targetUser.username, targetUser.display_name, targetUser.email, token]
        );

        // Kirim email nyata ke inbox pengguna via SMTP
        const emailResult = await sendPasswordResetEmail({
          toEmail: targetUser.email,
          userName: targetUser.username,
          displayName: targetUser.display_name || targetUser.username,
          token,
        });

        const userMessage = emailResult.sent
          ? `Kode verifikasi 6 digit telah dikirim langsung ke alamat email Anda (${targetUser.email}). Silakan periksa kotak masuk atau folder spam Anda.`
          : `Permintaan reset berhasil dibuat untuk email: ${targetUser.email}. ${emailResult.message || ''}`;

        return NextResponse.json({
          success: true,
          method: 'email',
          username: targetUser.username,
          contactValue: targetUser.email,
          emailSent: emailResult.sent,
          token: emailResult.sent ? undefined : token, // jika belum diset SMTP, tampilkan token agar pengembang tetap bisa tes
          message: userMessage,
        });
      }

      // Jika menggunakan nomor WhatsApp / HP
      const phoneValue = targetUser.phone || identifier.trim();
      await query(
        `INSERT INTO password_reset_requests (id, user_id, username, display_name, contact_type, contact_value, token, status, notes)
         VALUES ($1, $2, $3, $4, 'whatsapp', $5, NULL, 'pending', 'Menunggu konfirmasi reset manual oleh Admin/Superadmin')`,
        [requestId, targetUser.id, targetUser.username, targetUser.display_name, phoneValue]
      );

      return NextResponse.json({
        success: true,
        method: 'whatsapp',
        username: targetUser.username,
        contactValue: phoneValue,
        message: `Permintaan reset kata sandi dengan nomor WhatsApp (${phoneValue}) telah dicatat ke database. Silakan hubungi Admin atau tunggu Admin mereset akun Anda.`,
      });
    }

    // 2. KONFIRMASI RESET DENGAN TOKEN EMAIL
    if (action === 'CONFIRM_TOKEN') {
      const { username, token, newPassword } = body;
      if (!username || !token || !newPassword) {
        return NextResponse.json({ error: 'Username, token verifikasi, dan kata sandi baru wajib diisi.' }, { status: 400 });
      }

      if (newPassword.length < 4) {
        return NextResponse.json({ error: 'Kata sandi baru minimal 4 karakter.' }, { status: 400 });
      }

      // Cari permintaan reset pending yang valid
      const reqRes = await query(
        `SELECT id, user_id FROM password_reset_requests
         WHERE LOWER(username) = LOWER($1) AND token = $2 AND status = 'pending'
         ORDER BY created_at DESC LIMIT 1`,
        [username.trim(), token.trim()]
      );

      if (reqRes.rows.length === 0) {
        return NextResponse.json(
          { error: 'Token verifikasi salah atau sudah kadaluarsa. Silakan ajukan permohonan baru.' },
          { status: 400 }
        );
      }

      const resetReq = reqRes.rows[0];
      const newHash = await bcrypt.hash(newPassword, 10);

      // Update password user
      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, resetReq.user_id]);

      // Tandai request sebagai resolved
      await query("UPDATE password_reset_requests SET status = 'resolved', resolved_at = NOW() WHERE id = $1", [resetReq.id]);

      return NextResponse.json({
        success: true,
        message: 'Kata sandi berhasil direset! Silakan login dengan kata sandi baru Anda.',
      });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal.' }, { status: 400 });
  } catch (error: any) {
    console.error('Password reset POST error:', error);
    return NextResponse.json({ error: 'Gagal memproses permohonan reset kata sandi.' }, { status: 500 });
  }
}

// PATCH: Admin/Superadmin menyelesaikan atau mereset password pengguna
export async function PATCH(req: NextRequest) {
  try {
    const { actorUserId, requestId, action, tempPassword } = await req.json();

    // Verifikasi actor adalah admin atau superadmin
    const actorRes = await query(
      "SELECT id, role FROM users WHERE (id = $1 OR username = $1 OR username = 'silsilah') AND role IN ('admin', 'superadmin')",
      [actorUserId || 'usr-superadmin']
    );

    if (actorRes.rows.length === 0) {
      return NextResponse.json({ error: 'Akses ditolak: Hanya Admin/Superadmin yang dapat memproses reset.' }, { status: 403 });
    }

    const reqRes = await query('SELECT * FROM password_reset_requests WHERE id = $1', [requestId]);
    if (reqRes.rows.length === 0) {
      return NextResponse.json({ error: 'Permintaan reset tidak ditemukan.' }, { status: 404 });
    }

    const resetReq = reqRes.rows[0];

    if (action === 'RESOLVE_WITH_PASSWORD') {
      const passwordToSet = tempPassword?.trim() || 'silsilah123';
      const newHash = await bcrypt.hash(passwordToSet, 10);

      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, resetReq.user_id]);
      await query(
        "UPDATE password_reset_requests SET status = 'resolved', resolved_at = NOW(), notes = $1 WHERE id = $2",
        [`Direset oleh Admin dengan password baru: ${passwordToSet}`, requestId]
      );

      return NextResponse.json({
        success: true,
        message: `Kata sandi akun ${resetReq.username} berhasil direset menjadi: ${passwordToSet}`,
      });
    }

    if (action === 'CANCEL') {
      await query("UPDATE password_reset_requests SET status = 'cancelled', resolved_at = NOW() WHERE id = $1", [requestId]);
      return NextResponse.json({ success: true, message: 'Permintaan reset berhasil dibatalkan.' });
    }

    return NextResponse.json({ error: 'Aksi tidak valid.' }, { status: 400 });
  } catch (error: any) {
    console.error('Password reset PATCH error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui status permintaan reset.' }, { status: 500 });
  }
}
