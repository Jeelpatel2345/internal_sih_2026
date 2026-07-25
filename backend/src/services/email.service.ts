import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Internal SIH 2026</title>
<style>
  body { margin: 0; padding: 0; background: #F7F8FB; font-family: 'Segoe UI', Arial, sans-serif; }
  .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #C1272D, #1B3F8B); padding: 32px 24px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
  .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
  .body { padding: 32px 24px; color: #1E1E2A; }
  .body h2 { font-size: 20px; margin: 0 0 16px; }
  .body p { font-size: 15px; line-height: 1.6; color: #444; }
  .info-box { background: #F7F8FB; border-left: 4px solid #C1272D; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }
  .info-box strong { color: #1E1E2A; display: block; margin-bottom: 4px; }
  .badge { display: inline-block; padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: 600; }
  .badge-green { background: #DCFCE7; color: #16A34A; }
  .badge-amber { background: #FEF3C7; color: #D97706; }
  .note { background: #FFF1F1; border: 1px solid #FECACA; border-radius: 6px; padding: 12px 16px; margin: 20px 0; color: #991B1B; font-size: 14px; }
  .footer { background: #1E1E2A; padding: 20px 24px; text-align: center; }
  .footer p { color: rgba(255,255,255,0.5); font-size: 12px; margin: 0; }
  .divider { border: none; border-top: 1px solid #E5E7EB; margin: 20px 0; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>🚀 Internal SIH 2026</h1>
    <p>VSITR | Kadi Sarva Vishwavidyalaya</p>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    <p>© 2026 Internal SIH Hackathon — KSV / VSITR<br/>Organized by Research, Coding, Design & Soft Skills Clubs</p>
  </div>
</div>
</body>
</html>
`;

export const sendRegistrationSuccessEmail = async (params: {
  to: string;
  teamName: string;
  leaderName: string;
  registrationId: string;
}) => {
  const { to, teamName, leaderName, registrationId } = params;
  const html = baseTemplate(`
    <h2>🎉 Team Registration Successful!</h2>
    <p>Dear <strong>${leaderName}</strong>,</p>
    <p>Congratulations! Your team has been successfully registered for <strong>Internal SIH 2026</strong>.</p>
    <div class="info-box">
      <strong>Team Name:</strong> ${teamName}
      <strong style="margin-top:8px">Registration ID:</strong> <span style="color:#C1272D;font-size:18px;font-weight:700">${registrationId}</span>
      <strong style="margin-top:8px">Status:</strong> <span class="badge badge-amber">Pending Mentor Details</span>
    </div>
    <div class="note">
      ⚠️ <strong>Important:</strong> Please keep checking this email regularly. All further communication — screening schedules, problem statements, presentation dates, and selection updates — will be sent to this address.
    </div>
    <hr class="divider"/>
    <p>Your registration is currently marked as <strong>"Pending Mentor Details."</strong> You can submit your mentor information from the landing page using your Registration ID.</p>
    <p>Save your Registration ID: <strong style="color:#C1272D">${registrationId}</strong></p>
    <p>Best of luck!<br/><strong>Internal SIH 2026 Team</strong></p>
  `);

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject: `✅ SIH2026 Team Registration Confirmed — ${teamName}`,
      html,
    });
    logger.info(`Registration success email sent to ${to}`);
  } catch (err) {
    logger.error(`Failed to send registration email to ${to}:`, err);
  }
};

export const sendMentorSubmittedEmail = async (params: {
  to: string;
  teamName: string;
  leaderName: string;
  registrationId: string;
  mentorName: string;
}) => {
  const { to, teamName, leaderName, registrationId, mentorName } = params;
  const html = baseTemplate(`
    <h2>✅ Registration Complete!</h2>
    <p>Dear <strong>${leaderName}</strong>,</p>
    <p>Your SIH Internal Hackathon registration is now <strong>fully completed</strong>.</p>
    <div class="info-box">
      <strong>Team Name:</strong> ${teamName}
      <strong style="margin-top:8px">Registration ID:</strong> ${registrationId}
      <strong style="margin-top:8px">Mentor:</strong> ${mentorName}
      <strong style="margin-top:8px">Status:</strong> <span class="badge badge-green">Registration Complete ✅</span>
    </div>
    <p>All future communication — screening schedules, problem statements, presentation dates, and selection updates — will be shared with the Team Leader at this email.</p>
    <p>Best of luck!<br/><strong>Internal SIH 2026 Team</strong></p>
  `);

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject: `✅ SIH2026 Registration Complete — ${teamName}`,
      html,
    });
    logger.info(`Mentor submitted email sent to ${to}`);
  } catch (err) {
    logger.error(`Failed to send mentor email to ${to}:`, err);
  }
};

export const sendAdminNotificationEmail = async (params: {
  teamName: string;
  registrationId: string;
  leaderName: string;
  department: string;
}) => {
  const { teamName, registrationId, leaderName, department } = params;
  const html = baseTemplate(`
    <h2>📋 New Team Registered</h2>
    <p>A new team has been registered on the Internal SIH 2026 portal.</p>
    <div class="info-box">
      <strong>Team Name:</strong> ${teamName}
      <strong style="margin-top:8px">Registration ID:</strong> ${registrationId}
      <strong style="margin-top:8px">Leader:</strong> ${leaderName}
      <strong style="margin-top:8px">Department:</strong> ${department}
    </div>
    <p>Log in to the <a href="${config.adminUrl}">Admin Panel</a> to view full details.</p>
  `);

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: config.adminEmail,
      subject: `New Team Registered: ${teamName} [${registrationId}]`,
      html,
    });
  } catch (err) {
    logger.error('Failed to send admin notification email:', err);
  }
};

export const sendOTPEmail = async (params: { to: string; otp: string; name: string }) => {
  const { to, otp, name } = params;
  const html = baseTemplate(`
    <h2>🔐 Password Reset OTP</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>Your One-Time Password (OTP) for resetting your Admin Panel password is:</p>
    <div style="text-align:center;margin:28px 0">
      <span style="font-size:40px;font-weight:700;letter-spacing:12px;color:#C1272D">${otp}</span>
    </div>
    <p style="color:#888">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
    <p>If you did not request a password reset, please ignore this email.</p>
  `);

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject: 'SIH2026 Admin — Password Reset OTP',
      html,
    });
    logger.info(`OTP email sent to ${to}`);
  } catch (err) {
    logger.error(`Failed to send OTP email to ${to}:`, err);
    throw new Error('Unable to send the reset email. Please check the SMTP configuration and try again.');
  }
};
