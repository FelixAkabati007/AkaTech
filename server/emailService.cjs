const nodemailer = require("nodemailer");
const logger = require("./logging/logger.cjs");

// Configure transporter
// In production, these should be environment variables
const transporter = nodemailer.createTransport({
  service: "gmail", // Or your SMTP provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.debug("Mock email service", { 
      to, 
      subject,
      note: "Email credentials not configured - running in mock mode"
    });
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
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

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.debug("Mock invoice email service", { 
      to, 
      subject,
      attachmentSize: pdfBuffer ? pdfBuffer.length : 0,
      note: "Email credentials not configured - running in mock mode"
    });
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
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
  sendInvoiceEmail,
};
