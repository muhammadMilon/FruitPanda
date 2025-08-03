import nodemailer from 'nodemailer';
import { formatTaka } from './currency.js';

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransporter({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Development - use Ethereal Email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
};

// Email templates
const templates = {
  welcome: (data) => ({
    subject: 'Welcome to Fruit Panda! 🥭',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Fruit Panda!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151;">Hello ${data.name}!</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Thank you for joining Fruit Panda! We're excited to have you as part of our community.
          </p>
          <p style="color: #6b7280; line-height: 1.6;">
            You can now:
          </p>
          <ul style="color: #6b7280; line-height: 1.6;">
            <li>Browse fresh seasonal fruits from verified farmers</li>
            <li>Read our blog for fruit guides and health tips</li>
            <li>Use our AI fruit scanner to check quality</li>
            <li>Get personalized recommendations</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Start Shopping
            </a>
          </div>
        </div>
        <div style="background: #374151; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © ${new Date().getFullYear()} Fruit Panda. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  'password-reset': (data) => ({
    subject: 'Password Reset Request - Fruit Panda',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151;">Hello ${data.name}!</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            We received a request to reset your password for your Fruit Panda account.
          </p>
          <p style="color: #6b7280; line-height: 1.6;">
            Click the button below to reset your password. This link will expire in ${data.expiresIn}.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; line-height: 1.6; font-size: 14px;">
            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
          <p style="color: #6b7280; line-height: 1.6; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${data.resetUrl}" style="color: #10b981; word-break: break-all;">${data.resetUrl}</a>
          </p>
        </div>
        <div style="background: #374151; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © ${new Date().getFullYear()} Fruit Panda. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  'payment-confirmation': (data) => ({
    subject: `Payment Confirmation - Order #${data.order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Payment Confirmed!</h1>
          <p style="color: white; margin: 10px 0 0 0;">Order #${data.order.orderNumber}</p>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #374151;">Hello ${data.order.customerInfo.name}!</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Thank you for your payment! Your order has been confirmed and is being processed.
          </p>
          
          <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #065f46; margin: 0 0 10px 0;">Payment Details</h3>
            <p style="color: #047857; margin: 5px 0;">Payment Method: ${data.order.payment.method.toUpperCase()}</p>
            <p style="color: #047857; margin: 5px 0;">Amount Paid: ${formatTaka(data.order.pricing.total)}</p>
            <p style="color: #047857; margin: 5px 0;">Transaction ID: ${data.paymentDetails.transactionId || 'N/A'}</p>
            <p style="color: #047857; margin: 5px 0;">Date: ${new Date(data.order.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" 
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Order Details
            </a>
          </div>
          
          <p style="color: #6b7280; line-height: 1.6;">
            We'll send you updates about your order status. You can also track your order in your account dashboard.
          </p>
          
          <p style="color: #6b7280; line-height: 1.6; font-size: 14px;">
            If you have any questions, please contact us at support@fruitpanda.com
          </p>
        </div>
        <div style="background: #374151; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © ${new Date().getFullYear()} Fruit Panda. All rights reserved.
          </p>
        </div>
      </div>
    `
  })
};

export const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    const transporter = createTransporter();

    let emailContent = {};

    if (template && templates[template]) {
      emailContent = templates[template](data);
    } else if (html || text) {
      emailContent = { subject, html, text };
    } else {
      throw new Error('No email content provided');
    }

    const mailOptions = {
      from: `"Fruit Panda" <${process.env.EMAIL_FROM || 'noreply@fruitpanda.com'}>`,
      to,
      subject: emailContent.subject || subject,
      html: emailContent.html,
      text: emailContent.text
    };

    const result = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email sent:', nodemailer.getTestMessageUrl(result));
    }

    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};