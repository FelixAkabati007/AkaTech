const nodemailer = require("nodemailer");
const logger = require("./logging/logger.cjs");

const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
const emailFrom =
  process.env.EMAIL_FROM || emailUser || "AkaTech IT Solutions <no-reply@akatech.local>";

const createTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        emailUser && emailPass
          ? {
              user: emailUser,
              pass: emailPass,
            }
          : undefined,
    });
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

const sendEmail = async (to, subject, html) => {
  if (!emailUser || !emailPass) {
    logger.debug("Mock email service", { 
      to, 
      subject,
      note: "Email credentials not configured - running in mock mode"
    });
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: emailFrom,
      to,
      subject,
      html,
    });
    logger.info("Email sent", { to });
  } catch (error) {
    logger.error("Email send failed", { to, message: error.message });
  }
};

const sendLoginNotification = async (email, ip, userAgent) => {
  const subject = "Security Alert: New Admin Login Detected";
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>New Admin Login</h2>
      <p>A new login was detected for your administrative account.</p>
      <ul>
        <li><strong>Account:</strong> ${email}</li>
        <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
        <li><strong>IP Address:</strong> ${ip}</li>
        <li><strong>Device:</strong> ${userAgent}</li>
      </ul>
      <p>If this was not you, please contact support immediately.</p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  const subject = "Reset your AkaTech password";
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
      <h2>Password reset request</h2>
      <p>We received a request to reset the password for your AkaTech account.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#c5a059;color:#111;text-decoration:none;border-radius:6px;font-weight:bold;">
          Reset password
        </a>
      </p>
      <p>This link expires in 30 minutes. If you did not request it, you can safely ignore this email.</p>
      <p style="font-size:12px;color:#666;">AkaTech IT Solutions</p>
    </div>
  `;

  return sendEmail(email, subject, html);
};

const sendInvoiceEmail = async (to, invoiceData, pdfBuffer) => {
  const subject = `Invoice ${invoiceData.referenceNumber} from AkaTech IT Solution`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Invoice Details</h2>
      <p>Dear Customer,</p>
      <p>Please find attached your invoice <strong>${
        invoiceData.referenceNumber
      }</strong>.</p>
      <p><strong>Amount Due:</strong> GH₵ ${invoiceData.amount}</p>
      <p><strong>Due Date:</strong> ${new Date(
        invoiceData.dueDate
      ).toLocaleDateString()}</p>
      <p>Thank you for your business.</p>
      <hr />
      <p style="font-size: 12px; color: #666;">AkaTech IT Solution</p>
    </div>
  `;

  if (!emailUser || !emailPass) {
    logger.debug("Mock invoice email service", { 
      to, 
      subject,
      attachmentSize: pdfBuffer ? pdfBuffer.length : 0,
      note: "Email credentials not configured - running in mock mode"
    });
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: emailFrom,
      to,
      subject,
      html,
      attachments: [
        {
          filename: `Invoice-${invoiceData.referenceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
    logger.info("Invoice email sent", { to });
  } catch (error) {
    logger.error("Invoice email send failed", { to, message: error.message });
  }
};

module.exports = {
  sendEmail,
  sendLoginNotification,
  sendPasswordResetEmail,
  sendInvoiceEmail,
};
