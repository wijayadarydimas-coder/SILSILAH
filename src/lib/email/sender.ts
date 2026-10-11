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
  const host = process.env.SMTP_HOST?.trim();
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim() || (user ? `SILSILAH Keluarga <${user}>` : '');

  if (!host || !user || !pass) {
    const missing = [];
    if (!host) missing.push('SMTP_HOST');
    if (!user) missing.push('SMTP_USER');
    if (!pass) missing.push('SMTP_PASS');
    const msg = `Konfigurasi SMTP belum lengkap di file .env.local (${missing.join(', ')} belum diisi). Pengiriman email tidak dapat dilakukan.`;
    console.warn(`[SMTP Error] ${msg}`);
    return {
      sent: false,
      message: msg,
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
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #191714; border: 1px solid #393128; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="background: linear-gradient(135deg, #11100E, #211D18); padding: 26px; text-align: center; border-bottom: 1px solid #393128;">
          <h1 style="color: #C6A15B; font-size: 20px; margin: 0; font-weight: 700; letter-spacing: 2px;">SILSILAH KELUARGA</h1>
          <p style="color: #A79D8D; font-size: 12px; margin: 6px 0 0; letter-spacing: 0.5px;">Verifikasi Pemulihan Kata Sandi Trah</p>
        </div>
        <div style="padding: 28px 24px; color: #F1E8D8;">
          <p style="font-size: 15px; color: #F1E8D8; margin-top: 0;">Rahayu, <strong>${displayName || userName}</strong>,</p>
          <p style="font-size: 14px; color: #A79D8D; line-height: 1.6;">
            Kami menerima permohonan untuk mengatur ulang kata sandi akun SILSILAH dengan username <strong style="color: #C6A15B;">@${userName}</strong>. 
            Gunakan kode token verifikasi 6 digit di bawah ini untuk melanjutkan:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background: #211D18; border: 2px dashed #C6A15B; border-radius: 10px; padding: 14px 28px;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #C6A15B; font-family: monospace;">${token}</span>
            </div>
            <p style="font-size: 12px; color: #A79D8D; margin-top: 10px;">Kode verifikasi ini berlaku selama 30 menit.</p>
          </div>
          <p style="font-size: 12.5px; color: #8F8474; line-height: 1.5; border-top: 1px solid #393128; padding-top: 16px;">
            Jika Anda tidak merasa mengajukan permohonan ini, Anda dapat mengabaikan email ini dengan aman. Akun Anda tetap terlindungi.
          </p>
        </div>
        <div style="background: #11100E; padding: 14px 24px; text-align: center; border-top: 1px solid #393128; font-size: 11px; color: #8F8474;">
          Dikirim otomatis oleh Sistem Silsilah Keluarga Digital — Arsip Trah Leluhur
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
