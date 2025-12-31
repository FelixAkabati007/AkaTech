const crypto = require('crypto');
const http = require('http');

// Configuration
const SECRET = 'whsec_test_secret'; // Must match server env var
const PORT = 3001;
const PATH = '/api/webhooks/payment';

// Mock Payload
const payload = JSON.stringify({
  id: 'evt_test_webhook',
  object: 'event',
  type: 'invoice.payment_succeeded',
  data: {
    object: {
      id: 'in_test_invoice_id',
      amount_paid: 250000, // 2500.00
      currency: 'ghs',
      status: 'paid',
      customer_email: 'test@example.com',
      metadata: {
        invoiceId: 'INV-123456' // Must match an existing invoice or be handled gracefully
      }
    }
  }
});

// Generate Stripe Signature
const timestamp = Math.floor(Date.now() / 1000);
const signedPayload = `${timestamp}.${payload}`;
const signature = crypto
  .createHmac('sha256', SECRET)
  .update(signedPayload)
  .digest('hex');

const stripeSignature = `t=${timestamp},v1=${signature}`;

// Make Request
const options = {
  hostname: 'localhost',
  port: PORT,
  path: PATH,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Stripe-Signature': stripeSignature,
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.write(payload);
req.end();
