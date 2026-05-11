const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  // 1. Verify the signature to ensure the request came from Razorpay
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (signature !== digest) {
    console.error('Invalid Webhook Signature');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // 2. Handle the event
  const event = req.body.event;
  const payload = req.body.payload;

  console.log(`Received Webhook Event: ${event}`);

  switch (event) {
    case 'subscription.charged':
      // This is called every time a payment is successfully deducted (initial + renewals)
      const subscription = payload.subscription.entity;
      const payment = payload.payment.entity;
      console.log(`Payment of ${payment.amount / 100} successful for subscription ${subscription.id}`);
      // TODO: Update your database to grant/extend user access
      break;

    case 'subscription.cancelled':
      console.log(`Subscription ${payload.subscription.entity.id} was cancelled`);
      // TODO: Revoke user access in your database
      break;

    case 'subscription.halted':
      console.log(`Subscription ${payload.subscription.entity.id} halted due to payment failure`);
      // TODO: Notify user to update payment method
      break;

    default:
      console.log(`Unhandled event type: ${event}`);
  }

  // 3. Respond to Razorpay with a 200 OK
  res.status(200).json({ status: 'ok' });
};
