import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { formatTaka, formatTakaWithCommas } from './currency.js';

// Create receipt PDF
export const generateReceiptPDF = async (order, paymentDetails = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(24)
         .fillColor('#10b981')
         .text('Fruit Panda', { align: 'center' });
      
      doc.fontSize(16)
         .fillColor('#374151')
         .text('Payment Receipt', { align: 'center' });
      
      doc.moveDown(0.5);

      // Receipt details
      doc.fontSize(12)
         .fillColor('#6b7280')
         .text(`Receipt Number: ${order.orderNumber}`, { align: 'left' });
      
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'left' });
      doc.text(`Time: ${new Date(order.createdAt).toLocaleTimeString()}`, { align: 'left' });
      
      doc.moveDown();

      // Customer information
      doc.fontSize(14)
         .fillColor('#374151')
         .text('Customer Information', { underline: true });
      
      doc.fontSize(10)
         .fillColor('#6b7280')
         .text(`Name: ${order.customerInfo.name}`);
      doc.text(`Email: ${order.customerInfo.email}`);
      doc.text(`Phone: ${order.customerInfo.phone}`);
      
      doc.moveDown();

      // Shipping address
      doc.fontSize(14)
         .fillColor('#374151')
         .text('Shipping Address', { underline: true });
      
      doc.fontSize(10)
         .fillColor('#6b7280')
         .text(`${order.shippingAddress.fullName}`);
      doc.text(`${order.shippingAddress.address}`);
      doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.area}`);
      doc.text(`Phone: ${order.shippingAddress.phone}`);
      
      if (order.shippingAddress.instructions) {
        doc.text(`Instructions: ${order.shippingAddress.instructions}`);
      }
      
      doc.moveDown();

      // Payment information
      doc.fontSize(14)
         .fillColor('#374151')
         .text('Payment Information', { underline: true });
      
      doc.fontSize(10)
         .fillColor('#6b7280')
         .text(`Payment Method: ${order.payment.method.toUpperCase()}`);
      
      if (paymentDetails.transactionId) {
        doc.text(`Transaction ID: ${paymentDetails.transactionId}`);
      }
      
      if (order.payment.paidAt) {
        doc.text(`Paid At: ${new Date(order.payment.paidAt).toLocaleString()}`);
      }
      
      doc.moveDown();

      // Order items
      doc.fontSize(14)
         .fillColor('#374151')
         .text('Order Items', { underline: true });
      
      doc.moveDown(0.5);

      // Table header
      const tableTop = doc.y;
      const itemCodeX = 50;
      const itemNameX = 120;
      const qtyX = 300;
      const priceX = 350;
      const totalX = 450;

      doc.fontSize(10)
         .fillColor('#374151')
         .text('Item', itemNameX, tableTop)
         .text('Qty', qtyX, tableTop)
         .text('Price', priceX, tableTop)
         .text('Total', totalX, tableTop);

      doc.moveDown(0.5);

      // Table content
      let currentY = doc.y;
      order.items.forEach((item, index) => {
        doc.fontSize(9)
           .fillColor('#6b7280')
           .text(item.productInfo.name, itemNameX, currentY)
           .text(item.quantity.toString(), qtyX, currentY)
           .text(formatTaka(item.price), priceX, currentY)
           .text(formatTaka(item.subtotal), totalX, currentY);
        
        currentY += 20;
      });

      doc.moveDown();

      // Order summary
      const summaryY = doc.y + 20;
      doc.fontSize(12)
         .fillColor('#374151')
         .text('Order Summary', { underline: true });
      
      doc.fontSize(10)
         .fillColor('#6b7280')
         .text(`Subtotal: ${formatTaka(order.pricing.subtotal)}`, { align: 'right' });
      
      if (order.pricing.deliveryFee > 0) {
        doc.text(`Delivery Fee: ${formatTaka(order.pricing.deliveryFee)}`, { align: 'right' });
      }
      
      if (order.pricing.discount > 0) {
        doc.text(`Discount: -${formatTaka(order.pricing.discount)}`, { align: 'right' });
      }
      
      doc.fontSize(14)
         .fillColor('#10b981')
         .text(`Total: ${formatTaka(order.pricing.total)}`, { align: 'right' });
      
      doc.moveDown(2);

      // Footer
      doc.fontSize(10)
         .fillColor('#9ca3af')
         .text('Thank you for your order!', { align: 'center' });
      
      doc.text('For any questions, please contact us at support@fruitpanda.com', { align: 'center' });
      doc.text('© 2024 Fruit Panda. All rights reserved.', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Save receipt to file system
export const saveReceiptToFile = async (order, paymentDetails = {}) => {
  try {
    const pdfBuffer = await generateReceiptPDF(order, paymentDetails);
    
    // Create receipts directory if it doesn't exist
    const receiptsDir = path.join(process.cwd(), 'receipts');
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }
    
    const fileName = `receipt-${order.orderNumber}-${Date.now()}.pdf`;
    const filePath = path.join(receiptsDir, fileName);
    
    fs.writeFileSync(filePath, pdfBuffer);
    
    return {
      fileName,
      filePath,
      buffer: pdfBuffer
    };
  } catch (error) {
    console.error('Error saving receipt:', error);
    throw error;
  }
};

// Generate receipt data for email
export const generateReceiptHTML = (order, paymentDetails = {}) => {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.productInfo.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatTaka(item.price)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatTaka(item.subtotal)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Payment Receipt</h1>
        <p style="color: white; margin: 10px 0 0 0;">Order #${order.orderNumber}</p>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; margin-bottom: 10px;">Customer Information</h3>
          <p style="color: #6b7280; margin: 5px 0;">Name: ${order.customerInfo.name}</p>
          <p style="color: #6b7280; margin: 5px 0;">Email: ${order.customerInfo.email}</p>
          <p style="color: #6b7280; margin: 5px 0;">Phone: ${order.customerInfo.phone}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; margin-bottom: 10px;">Shipping Address</h3>
          <p style="color: #6b7280; margin: 5px 0;">${order.shippingAddress.fullName}</p>
          <p style="color: #6b7280; margin: 5px 0;">${order.shippingAddress.address}</p>
          <p style="color: #6b7280; margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.area}</p>
          <p style="color: #6b7280; margin: 5px 0;">Phone: ${order.shippingAddress.phone}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; margin-bottom: 10px;">Payment Information</h3>
          <p style="color: #6b7280; margin: 5px 0;">Payment Method: ${order.payment.method.toUpperCase()}</p>
          ${paymentDetails.transactionId ? `<p style="color: #6b7280; margin: 5px 0;">Transaction ID: ${paymentDetails.transactionId}</p>` : ''}
          <p style="color: #6b7280; margin: 5px 0;">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; margin-bottom: 10px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #d1d5db;">Item</th>
                <th style="padding: 8px; text-align: center; border-bottom: 2px solid #d1d5db;">Qty</th>
                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #d1d5db;">Price</th>
                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #d1d5db;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>
        
        <div style="text-align: right; margin-top: 20px;">
          <p style="color: #6b7280; margin: 5px 0;">Subtotal: ${formatTaka(order.pricing.subtotal)}</p>
          ${order.pricing.deliveryFee > 0 ? `<p style="color: #6b7280; margin: 5px 0;">Delivery Fee: ${formatTaka(order.pricing.deliveryFee)}</p>` : ''}
          ${order.pricing.discount > 0 ? `<p style="color: #6b7280; margin: 5px 0;">Discount: -${formatTaka(order.pricing.discount)}</p>` : ''}
          <h3 style="color: #10b981; margin: 10px 0;">Total: ${formatTaka(order.pricing.total)}</h3>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280;">Thank you for your order!</p>
          <p style="color: #6b7280; font-size: 14px;">For any questions, please contact us at support@fruitpanda.com</p>
        </div>
      </div>
      
      <div style="background: #374151; padding: 20px; text-align: center;">
        <p style="color: #9ca3af; margin: 0; font-size: 14px;">
          © ${new Date().getFullYear()} Fruit Panda. All rights reserved.
        </p>
      </div>
    </div>
  `;
}; 