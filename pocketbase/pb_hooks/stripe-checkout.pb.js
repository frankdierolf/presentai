/// <reference path="../pb_data/types.d.ts" />

routerAdd('POST', '/create-checkout-session', async (e) => {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      return e.json(500, { message: 'Stripe secret key not found' });
    }
    const utils = require(`${__hooks}/checkout-utils.js`);

    // Authenticate user
    const info = e.requestInfo();
    const token = info.headers['authorization'] || '';
    let userRecord;
    try {
      userRecord = await $app.findAuthRecordByToken(token, 'auth');
    } catch (error) {
      return e.json(401, { message: 'User not authorized' });
    }

    // Get or create customer
    let customerId;
    try {
      customerId = await utils.createOrGetCustomer(userRecord, apiKey);
    } catch (error) {
      return e.json(400, { message: 'Unable to create or use customer' });
    }

    // Create session parameters
    if (!['recurring', 'one_time'].includes(info.body.price.type)) {
      throw new Error('Invalid price type');
    }

    const sessionParams = utils.createSessionParams(
      customerId,
      info.body.price,
      info.body.quantity || 1
    );

    // Create checkout session
    try {
      console.log('🔄 Creating checkout session with params:', sessionParams);
      $app.logger().info('Creating checkout session', 'checkout', sessionParams);
      
      const response = await $http.send({
        url: 'https://api.stripe.com/v1/checkout/sessions',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${apiKey}`,
        },
        body: utils.formatRequestBody(sessionParams),
      });

      // Enhanced error handling based on research example
      console.log(`📊 Stripe API Response - Status: ${response.statusCode}`);
      $app.logger().info(`Stripe checkout response status: ${response.statusCode}`, 'checkout');
      
      if (response.statusCode !== 200) {
        const errorMsg = response.json.error?.message || 'Unknown Stripe API error';
        console.error('❌ Stripe API Error:', response.statusCode, errorMsg);
        $app.logger().error('Stripe checkout session creation failed', 'checkout', {
          status: response.statusCode,
          error: response.json.error,
          full_response: response.json
        });
        return e.json(400, {
          message: 'Failed to create checkout session',
          error: errorMsg,
          status: response.statusCode
        });
      }

      if (response.json.error) {
        console.error('❌ Stripe Response Error:', response.json.error);
        $app.logger().error('Stripe response contains error', 'checkout', response.json.error);
        return e.json(400, {
          message: 'Failed to create checkout',
          error: response.json.error,
        });
      }

      // Success logging
      const sessionId = response.json.id;
      const sessionUrl = response.json.url;
      console.log(`✅ Checkout session created successfully: ${sessionId}`);
      console.log(`🔗 Checkout URL: ${sessionUrl}`);
      $app.logger().info('Checkout session created successfully', 'checkout', {
        session_id: sessionId,
        session_url: sessionUrl,
        customer: response.json.customer,
        amount_total: response.json.amount_total,
        status: response.json.status,
        payment_status: response.json.payment_status
      });
      
      return e.json(200, response.json);
    } catch (error) {
      console.error('❌ Exception creating checkout session:', error);
      $app.logger().error('Exception in checkout session creation:', error);
      return e.json(500, { 
        message: 'Internal error creating checkout session',
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Error creating checkout:', error);
    return e.json(400, { message: error });
  }
});
