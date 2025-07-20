/// <reference path="../pb_data/types.d.ts" />

routerAdd('POST', '/stripe', (e) => {
  console.log('webhook triggered, yes!!');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if(!secret) {
      throw new BadRequestError('Stripe webhook secret not found.');
  }

  const info = e.requestInfo();
  let signature = info.headers['stripe_signature'] || '';
  const rawBody = readerToString(e.request.body);
  const utils = require(`${__hooks}/webhook-utils.js`);
  signature = utils.parseStripeSignature(signature);
  $app.logger().info('Received data:', 'json', signature);
  console.info('Received data:', 'json', signature);

  const isValid = utils.validateWebhookSignature(signature, rawBody, secret);
  if (!isValid) {
      throw new BadRequestError(`Invalid webhook signature.`);
  }

  const data = info.body;
  console.log(`🎯 Processing webhook event: ${data.type} [${data.id}]`);
  $app.logger().info(`Processing webhook event: ${data.type}`, 'webhook', {
    event_id: data.id,
    event_type: data.type,
    created: data.created,
    livemode: data.livemode
  });

  try {
      switch (data.type) {
          case 'product.created':
          case 'product.updated':
              utils.handleProductEvent(data.data.object);
              break;
          case 'price.created':
          case 'price.updated':
              utils.handlePriceEvent(data.data.object);
              break;
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
              utils.handleSubscriptionEvent(data.data.object);
              break;
          case 'checkout.session.completed':
              console.log(`🛒 Processing checkout session completed: ${data.data.object.id}`);
              console.log(`💰 Amount: ${data.data.object.amount_total} ${data.data.object.currency}`);
              console.log(`👤 Customer: ${data.data.object.customer}`);
              console.log(`🎯 Mode: ${data.data.object.mode}`);
              $app.logger().info('Checkout session completed', 'webhook', {
                session_id: data.data.object.id,
                customer_id: data.data.object.customer,
                amount_total: data.data.object.amount_total,
                currency: data.data.object.currency,
                mode: data.data.object.mode,
                payment_status: data.data.object.payment_status,
                subscription: data.data.object.subscription
              });
              utils.handleCheckoutSessionEvent(data.data.object);
              console.log(`✅ Checkout session processing completed for: ${data.data.object.id}`);
              break;
          default:
              console.log(`⚠️  Ignoring unhandled event type: ${data.type}`);
              $app.logger().info(`Ignored unhandled event type: ${data.type}`, 'webhook', {
                  event_type: data.type,
                  event_id: data.id
              });
      }
  } catch (err) {
      console.error(`❌ Error processing ${data.type} [${data.id}]:`, err);
      $app.logger().error(`Error processing ${data.type}:`, err);
      throw new BadRequestError(`Failed to process ${data.type}: ` + err.message);
  }

  console.log(`✅ Successfully processed webhook event: ${data.type} [${data.id}]`);
  $app.logger().info(`Webhook processing completed: ${data.type}`, 'webhook', {
    event_id: data.id,
    success: true
  });
  
  return e.json(200, { message: 'Webhook processed successfully', event_type: data.type, event_id: data.id });
});
