import nodemailer from 'nodemailer';

export interface SendVerificationEmailParams {
  toEmail: string;
  userName: string;
  displayName: string;
  token: string;
}

export async function sendPasswordResetEmail({
  toEmail,
  userName,
  displayName,
  token,
}: SendVerificationEmailParams): Promise<{ sent: boolean; message?: string }> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim() || (user ? `SILSILAH Keluarga <${user}>` : 'noreply@silsilah.local');

  if (!user || !pass) {
    console.warn('[SMTP] Kredensial SMTP belum diset di .env.local (SMTP_USER dan SMTP_PASS).');
    return {
      sent: false,
      message: 'SMTP belum dikonfigurasi di .env.local. Token ditampilkan di layar untuk pengujian lokal.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0F172A, #1E293B); padding: 24px; text-align: center;">
          <h1 style="color: #38BDF8; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: 1px;">SILSILAH KELUARGA</h1>
          <p style="color: #94A3B8; font-size: 13px; margin: 6px 0 0;">Verifikasi Pemulihan Kata Sandi</p>
        </div>
        <div style="padding: 28px 24px;">
          <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Halo <strong>${displayName || userName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Kami menerima permohonan untuk mengatur ulang kata sandi akun SILSILAH Anda (<strong>@${userName}</strong>). 
            Gunakan kode token verifikasi 6 digit di bawah ini untuk melanjutkan:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background: #F0F9FF; border: 2px dashed #0284C7; border-radius: 10px; padding: 14px 28px;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0284C7; font-family: monospace;">${token}</span>
            </div>
            <p style="font-size: 12px; color: #64748B; margin-top: 10px;">Kode verifikasi ini berlaku selama 30 menit.</p>
          </div>
          <p style="font-size: 13px; color: #64748B; line-height: 1.5; border-top: 1px solid #F1F5F9; padding-top: 16px;">
            Jika Anda tidak merasa mengajukan permohonan ini, Anda dapat mengabaikan email ini dengan aman. Akun Anda tetap terlindungi.
          </p>
        </div>
        <div style="background: #F8FAFC; padding: 14px 24px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8;">
          Dikirim otomatis oleh Sistem Silsilah Keluarga Digital
        </div>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: toEmail,
      subject: `[SILSILAH] Kode Verifikasi Reset Kata Sandi: ${token}`,
      text: `Halo ${displayName || userName}, kode verifikasi reset kata sandi Anda adalah: ${token}. Berlaku 30 menit.`,
      html: htmlContent,
    });

    console.log(`[SMTP] Email verifikasi berhasil dikirim ke: ${toEmail}`);
    return { sent: true };
  } catch (error: any) {
    console.error('[SMTP] Gagal mengirim email reset kata sandi:', error);
    return { sent: false, message: error.message };
  }
}
