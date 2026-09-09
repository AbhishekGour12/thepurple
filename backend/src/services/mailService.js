import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from '../config/logger.js';

let transporter = null;

function getMailTransporter() {
  if (transporter) return transporter;

  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 587,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER.trim(),
        pass: env.SMTP_PASSWORD.replace(/\s+/g, ''),
      },
    });
    logger.info(`Configured SMTP transporter with host: ${env.SMTP_HOST}`);
  } else {
    // In dev / test when SMTP is not configured, create a mock transporter or etherial
    logger.info('SMTP credentials not configured; mail service operating in fallback logger mode.');
  }

  return transporter;
}

export const mailService = {
  /**
   * Send Password Reset Link to Admin
   */
  async sendPasswordResetEmail({ toEmail, resetUrl, adminName }) {
    const subject = 'Reset Your Password — ThePurple Admin Panel';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E9D5FF; border-radius: 12px; background-color: #FAF5FF;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6B21A8; margin: 0; font-size: 24px; letter-spacing: -0.5px;">ThePurple</h1>
          <p style="color: #581C87; margin: 4px 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase;">Admin Portal</p>
        </div>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #E9D5FF;">
          <h2 style="color: #2E1065; font-size: 18px; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #374151; line-height: 1.5;">Hello ${adminName || 'Admin'},</p>
          <p style="color: #374151; line-height: 1.5;">We received a request to reset your password for your ThePurple Admin account. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #7E22CE; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #6B7280; font-size: 13px; line-height: 1.4;">This link will expire in <strong>1 hour</strong>. If you did not request this, please ignore this email.</p>
          <p style="color: #9CA3AF; font-size: 12px; word-break: break-all; margin-top: 20px;">Or copy and paste this link in your browser: <br/>${resetUrl}</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9CA3AF; font-size: 12px;">
          &copy; ${new Date().getFullYear()} ThePurple. All rights reserved.
        </div>
      </div>
    `;

    const transport = getMailTransporter();
    if (transport) {
      try {
        await transport.sendMail({
          from: env.SMTP_FROM,
          to: toEmail,
          subject,
          html,
        });
        logger.info(`Password reset email sent to ${toEmail}`);
      } catch (err) {
        logger.error(`Failed to send password reset email via SMTP: ${err.message}`);
      }
    } else {
      logger.info(`[MAIL MOCK] Password Reset Email for ${toEmail}: Reset URL = ${resetUrl}`);
    }

    return { sent: true, resetUrl };
  },

  /**
   * Send Welcome Email with Temporary Password
   */
  async sendWelcomeAdminEmail({ toEmail, adminName, role, temporaryPassword, loginUrl }) {
    const subject = 'Welcome to ThePurple Admin Panel — Account Credentials';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E9D5FF; border-radius: 12px; background-color: #FAF5FF;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6B21A8; margin: 0; font-size: 24px; letter-spacing: -0.5px;">ThePurple</h1>
          <p style="color: #581C87; margin: 4px 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase;">Admin Portal</p>
        </div>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #E9D5FF;">
          <h2 style="color: #2E1065; font-size: 18px; margin-top: 0;">Welcome, ${adminName}!</h2>
          <p style="color: #374151; line-height: 1.5;">An administrative account has been created for you on <strong>ThePurple Admin Panel</strong> with the role of <strong>${role}</strong>.</p>
          
          <div style="background-color: #FAF5FF; border-left: 4px solid #7E22CE; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; color: #2E1065;"><strong>Email:</strong> ${toEmail}</p>
            <p style="margin: 0; color: #2E1065;"><strong>Temporary Password:</strong> <code style="background-color: #E9D5FF; padding: 2px 6px; border-radius: 4px; font-size: 15px; font-weight: bold;">${temporaryPassword}</code></p>
          </div>

          <p style="color: #DC2626; font-size: 14px; font-weight: bold;">Important: You will be required to change your temporary password upon your first login.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #7E22CE; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log in to Admin Panel</a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9CA3AF; font-size: 12px;">
          &copy; ${new Date().getFullYear()} ThePurple. All rights reserved.
        </div>
      </div>
    `;

    const transport = getMailTransporter();
    if (transport) {
      try {
        await transport.sendMail({
          from: env.SMTP_FROM,
          to: toEmail,
          subject,
          html,
        });
        logger.info(`Welcome email with temporary password sent to ${toEmail}`);
      } catch (err) {
        logger.error(`Failed to send welcome email via SMTP: ${err.message}`);
      }
    } else {
      logger.info(`[MAIL MOCK] Welcome Email for ${toEmail} (${role}): Temp Password = ${temporaryPassword}`);
    }

    return { sent: true };
  },
};

export default mailService;
