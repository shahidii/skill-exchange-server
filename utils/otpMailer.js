// utility/mailer.js
// Sends HTML OTP emails via SMTP if configured; otherwise logs using pino logger.
const { logger } = require('./logger');
const { getTransporter, isSmtpConfigured } = require('../config/mailer');

function buildOtpHtml({ otp, ttlSeconds }) {
  const expiresText = ttlSeconds < 60 ? `${ttlSeconds} seconds` : `${Math.round(ttlSeconds / 60)} minute(s)`;
  return `
  <div style="font-family: Arial, sans-serif; background:#f8f9fb; padding:24px;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:10px; box-shadow:0 4px 14px rgba(0,0,0,0.08); overflow:hidden;">
      <div style="background:#4f46e5; color:#fff; padding:20px 24px;">
        <h2 style="margin:0; font-weight:600;">SkillSwap Platform</h2>
        <p style="margin:4px 0 0; opacity:0.9;">Secure Password Reset</p>
      </div>
      <div style="padding:24px; color:#111827;">
        <p style="margin-top:0;">We received a request to reset your password. Use the OTP below to proceed:</p>
        <div style="text-align:center; margin:24px 0;">
          <div style="display:inline-block; letter-spacing:6px; font-size:32px; font-weight:700; background:#eef2ff; color:#1f2937; padding:12px 18px; border-radius:8px; border:1px solid #e5e7eb;">
            ${otp}
          </div>
        </div>
        <p style="margin:0; color:#374151;">This OTP is valid for <strong>${expiresText}</strong>. Do not share it with anyone.</p>
        <p style="margin:16px 0 0; color:#6b7280; font-size:12px;">If you did not request this, you can safely ignore this email.</p>
      </div>
      <div style="background:#f3f4f6; color:#6b7280; padding:16px 24px; font-size:12px;">
        <p style="margin:0;">© ${new Date().getFullYear()} SkillSwap Platform</p>
      </div>
    </div>
  </div>`;
}

async function sendOtpEmail({ to, otp, ttlSeconds = 60 }) {
  if (!to || !otp) {
    throw new Error('to and otp are required for sendOtpEmail');
  }

  // Fallback: if SMTP not configured, log a warning and return (non-fatal)
  if (!isSmtpConfigured()) {
    logger.warn({ to, ttlSeconds }, '[MAIL:FALLBACK] SMTP not configured. OTP logged.');
    logger.info(`[MAIL:FALLBACK] OTP for ${to}: ${otp} (valid ${ttlSeconds}s)`);
    return; // do not throw; treat as non-fatal fallback
  }

  const transporter = getTransporter();

  const html = buildOtpHtml({ otp, ttlSeconds });

  try {
    (async () => {
      const info = await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: "Your SkillSwap OTP Code",
        html,
      });
      logger.info('OTP email sent successfully');
    })();
    // await transporter.sendMail({
    //   from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
    //   to,
    //   subject: 'Your SkillSwap OTP Code',
    //   html,
    // });
    // logger.info({ to }, 'OTP email sent successfully');
  } catch (err) {
    logger.error({ err, to }, 'Failed to send OTP email');
    err.code = err.code || 'MAIL_SEND_FAILED';
    err.statusCode = err.statusCode || 500;
    throw err; // bubble to error handler
  }
}

module.exports = { sendOtpEmail };
