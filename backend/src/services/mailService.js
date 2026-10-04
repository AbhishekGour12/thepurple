import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from '../config/logger.js';

let smtpTransporter = null;

/**
 * Get or initialize ZeptoMail SMTP Transporter (Fallback)
 */
function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;

  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD) {
    smtpTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 587,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER.trim(),
        pass: env.SMTP_PASSWORD.trim(),
      },
    });
    logger.info(`[MailService] Configured ZeptoMail SMTP with host: ${env.SMTP_HOST}:${env.SMTP_PORT}`);
  }
  return smtpTransporter;
}

/**
 * Send email directly via Zoho ZeptoMail / CPaaS REST API (Primary)
 */
async function sendViaZeptoMailApi({ to, toName, subject, html, text, fromAddress, fromName }) {
  const apiKey = env.ZEPTOMAIL_API_KEY;
  if (!apiKey) return { success: false, message: 'ZeptoMail API key not configured' };

  const authHeader = apiKey.startsWith('Zoho-enczapikey') ? apiKey : `Zoho-enczapikey ${apiKey.trim()}`;
  const host = env.ZEPTOMAIL_HOST || 'cpaas.zoho.in';
  const url = `https://${host}/v1.1/email`;

  const senderAddress = fromAddress || env.ZEPTOMAIL_FROM_ADDRESS || 'noreply@thepurple.online';
  const senderName = fromName || env.ZEPTOMAIL_FROM_NAME || 'ThePurple';

  const payload = {
    from: {
      address: senderAddress,
      name: senderName,
    },
    to: [
      {
        email_address: {
          address: to,
          name: toName || to.split('@')[0],
        },
      },
    ],
    subject,
    htmlbody: html,
  };

  if (text) {
    payload.textbody = text;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      logger.info(`[ZeptoMail REST] Email successfully delivered to ${to} (Subject: "${subject}")`);
      return { success: true, data };
    }

    logger.warn(
      `[ZeptoMail REST API returned ${res.status}] ${data.message || JSON.stringify(data.error || data)}. Falling back to SMTP...`
    );
    return { success: false, status: res.status, data };
  } catch (err) {
    logger.warn(`[ZeptoMail REST API Exception] ${err.message}. Falling back to SMTP...`);
    return { success: false, error: err.message };
  }
}

/**
 * Unified sendMail dispatcher with automatic REST API -> SMTP fallback
 */
export async function sendMail({ to, toName, subject, html, text, fromAddress, fromName }) {
  // 1. Try ZeptoMail REST API (cpaas.zoho.in)
  if (env.ZEPTOMAIL_API_KEY) {
    const apiResult = await sendViaZeptoMailApi({ to, toName, subject, html, text, fromAddress, fromName });
    if (apiResult.success) {
      return { sent: true, provider: 'zeptomail_rest', data: apiResult.data };
    }
  }

  // 2. Try ZeptoMail SMTP fallback
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: env.SMTP_FROM || `"${fromName || 'ThePurple'}" <${fromAddress || 'noreply@thepurple.online'}>`,
        to: toName ? `"${toName}" <${to}>` : to,
        subject,
        html,
        text,
      });
      logger.info(`[ZeptoMail SMTP] Email sent to ${to} (MessageId: ${info.messageId})`);
      return { sent: true, provider: 'zeptomail_smtp', info };
    } catch (smtpErr) {
      logger.error(`[ZeptoMail SMTP Error] Failed to send email to ${to}: ${smtpErr.message}`);
    }
  }

  // 3. Fallback log for development/test
  logger.info(`[MAIL LOG ONLY] To: ${to} | Subject: "${subject}"`);
  return { sent: false, provider: 'mock' };
}

export const mailService = {
  sendMail,

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

    return sendMail({
      to: toEmail,
      toName: adminName,
      subject,
      html,
    });
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

    return sendMail({
      to: toEmail,
      toName: adminName,
      subject,
      html,
    });
  },

  /**
   * Send Reply Email to User for Contact Query
   */
  async sendContactQueryReplyEmail({
    toEmail,
    recipientName,
    subject: originalSubject,
    originalMessage,
    replyMessage,
    adminName = 'ThePurple Concierge Team',
    queryId,
  }) {
    const emailSubject = `Response to your inquiry: ${originalSubject || 'ThePurple Support'}`;
    const formattedReply = (replyMessage || '').replace(/\n/g, '<br/>');
    const formattedOriginal = (originalMessage || '').replace(/\n/g, '<br/>');

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; padding: 28px 20px; background-color: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background: linear-gradient(135deg, #6B21A8 0%, #9333EA 100%); color: #ffffff; font-weight: 800; font-size: 20px; border-radius: 12px; margin-bottom: 8px;">
            TP
          </div>
          <h1 style="color: #4C1D95; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ThePurple</h1>
          <p style="color: #7E22CE; margin: 2px 0 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Customer Concierge Support</p>
        </div>

        <div style="background-color: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid #E9D5FF; box-shadow: 0 4px 12px rgba(109, 40, 217, 0.04);">
          <h2 style="color: #1E1B4B; font-size: 19px; margin-top: 0; font-weight: 700;">Hello ${recipientName || 'Valued Customer'},</h2>
          
          <p style="color: #374151; font-size: 14.5px; line-height: 1.6; margin-bottom: 20px;">
            Thank you for reaching out to us. Our concierge team has reviewed your query regarding <strong>"${originalSubject || 'General Inquiry'}"</strong>.
          </p>

          <div style="background: linear-gradient(180deg, #FAF5FF 0%, #F3E8FF 100%); border-left: 4px solid #7E22CE; padding: 18px 20px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #6B21A8;">
              Official Response from ${adminName}
            </p>
            <div style="color: #1F2937; font-size: 14.5px; line-height: 1.7; font-weight: 500;">
              ${formattedReply}
            </div>
          </div>

          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin-top: 24px;">
            <p style="margin: 0 0 6px 0; font-size: 11.5px; font-weight: 700; color: #64748B; text-transform: uppercase;">
              Your Original Message:
            </p>
            <p style="margin: 0; font-size: 13.5px; color: #475569; font-style: italic; line-height: 1.5;">
              "${formattedOriginal}"
            </p>
          </div>

          <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #F3E8FF; font-size: 13.5px; color: #6B7280; line-height: 1.5;">
            <p style="margin: 0 0 6px 0;">If you have any further questions or need additional assistance, please feel free to reply to this email or visit our website.</p>
            <p style="margin: 0; color: #4C1D95; font-weight: 700;">Warm regards,<br/>ThePurple Team</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #9CA3AF; font-size: 12px; line-height: 1.4;">
          ${queryId ? `<p style="margin: 0 0 4px;">Ticket Ref: <code>${queryId}</code></p>` : ''}
          &copy; ${new Date().getFullYear()} ThePurple Luxury Jewellery &amp; Gifts. All rights reserved.
        </div>
      </div>
    `;

    return sendMail({
      to: toEmail,
      toName: recipientName,
      subject: emailSubject,
      html,
    });
  },

  /**
   * Send Confirmation Email to User when they submit a Contact Query
   */
  async sendContactQueryReceivedEmail({ toEmail, recipientName, subject: querySubject, queryId }) {
    const emailSubject = `We've received your query: ${querySubject || 'ThePurple Support'}`;
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 14px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #6B21A8; margin: 0; font-size: 24px; font-weight: 800;">ThePurple</h1>
          <p style="color: #7E22CE; margin: 2px 0 0; font-size: 12px; font-weight: 700; text-transform: uppercase;">Inquiry Confirmation</p>
        </div>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 10px; border: 1px solid #E9D5FF;">
          <h2 style="color: #1E1B4B; font-size: 18px; margin-top: 0;">Thank You, ${recipientName || 'Valued Customer'}!</h2>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">
            We have received your message regarding <strong>"${querySubject || 'General Inquiry'}"</strong>.
          </p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">
            Our support concierge usually responds within <strong>24 hours</strong>. We will get back to you directly at this email address.
          </p>
          ${queryId ? `<div style="background-color: #FAF5FF; padding: 12px; border-radius: 6px; font-size: 13px; color: #6B21A8; font-weight: 600; text-align: center; margin: 20px 0;">Reference ID: ${queryId}</div>` : ''}
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9CA3AF; font-size: 12px;">
          &copy; ${new Date().getFullYear()} ThePurple. All rights reserved.
        </div>
      </div>
    `;

    return sendMail({
      to: toEmail,
      toName: recipientName,
      subject: emailSubject,
      html,
    });
  },

  /**
   * Send Order Confirmation Email
   */
  async sendOrderConfirmationEmail({ order, customerEmail, customerName }) {
    if (!customerEmail || !order) return { sent: false };

    const emailSubject = `Order Confirmed: #${order.orderNumber} — ThePurple`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E9D5FF; border-radius: 12px; background-color: #FAF5FF;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6B21A8; margin: 0; font-size: 24px;">ThePurple</h1>
          <p style="color: #581C87; margin: 4px 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase;">Order Confirmation</p>
        </div>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #E9D5FF;">
          <h2 style="color: #2E1065; font-size: 18px; margin-top: 0;">Thank You for Your Order!</h2>
          <p style="color: #374151; line-height: 1.5;">Hello ${customerName || 'Valued Customer'},</p>
          <p style="color: #374151; line-height: 1.5;">Your order <strong>#${order.orderNumber}</strong> has been confirmed and is being prepared for packaging and shipping.</p>
          
          <div style="background-color: #FAF5FF; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0 0 6px 0; color: #2E1065;"><strong>Order Total:</strong> ₹${parseFloat(order.totalAmount || 0).toLocaleString('en-IN')}</p>
            <p style="margin: 0; color: #2E1065;"><strong>Payment Method:</strong> ${order.paymentMethod || 'Prepaid'}</p>
          </div>

          <p style="color: #6B7280; font-size: 13px;">You will receive live Shiprocket tracking updates as soon as your parcel is dispatched from our warehouse.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9CA3AF; font-size: 12px;">
          &copy; ${new Date().getFullYear()} ThePurple. All rights reserved.
        </div>
      </div>
    `;

    return sendMail({
      to: customerEmail,
      toName: customerName,
      subject: emailSubject,
      html,
    });
  },

  /**
   * Send Order Cancellation Email
   */
  async sendOrderCancellationEmail({ order, customerEmail, customerName, reason }) {
    if (!customerEmail || !order) return { sent: false };

    const emailSubject = `Order Cancelled: #${order.orderNumber} — ThePurple`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #FECACA; border-radius: 12px; background-color: #FEF2F2;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #991B1B; margin: 0; font-size: 24px;">ThePurple</h1>
          <p style="color: #B91C1C; margin: 4px 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase;">Order Cancellation Notice</p>
        </div>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #FECACA;">
          <h2 style="color: #991B1B; font-size: 18px; margin-top: 0;">Order #${order.orderNumber} Cancelled</h2>
          <p style="color: #374151; line-height: 1.5;">Hello ${customerName || 'Valued Customer'},</p>
          <p style="color: #374151; line-height: 1.5;">Your order <strong>#${order.orderNumber}</strong> has been cancelled.</p>
          
          <div style="background-color: #FEF2F2; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0 0 6px 0; color: #991B1B;"><strong>Cancellation Reason:</strong> ${reason || 'Cancelled per customer/admin request'}</p>
            ${
              order.refundStatus === 'REQUESTED'
                ? `<p style="margin: 0; color: #B45309;"><strong>Refund Status:</strong> A refund of ₹${parseFloat(order.totalAmount || 0).toLocaleString('en-IN')} has been initiated.</p>`
                : ''
            }
          </div>

          <p style="color: #6B7280; font-size: 13px;">If you have questions or need assistance, please reply to this email or reach out to our concierge.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9CA3AF; font-size: 12px;">
          &copy; ${new Date().getFullYear()} ThePurple. All rights reserved.
        </div>
      </div>
    `;

    return sendMail({
      to: customerEmail,
      toName: customerName,
      subject: emailSubject,
      html,
    });
  },
};

export default mailService;
