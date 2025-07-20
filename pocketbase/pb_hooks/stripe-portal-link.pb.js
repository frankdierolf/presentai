routerAdd('GET', '/create-portal-link', async (e) => {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  const info = e.requestInfo();
  const token = info.headers['authorization'] || '';
  let userRecord;
  
  console.log('🔗 Portal link request received');
  $app.logger().info('Portal link request started', 'stripe-portal', {
    has_api_key: !!apiKey,
    has_token: !!token
  });
  
  try {
    userRecord = await $app.findAuthRecordByToken(token, 'auth');

    const customerRecord = await $app.findFirstRecordByFilter(
      'customer',
      `user_id = "${userRecord.id}"`
    );

    if (!customerRecord) {
      console.log('❌ Customer not found for user:', userRecord.id);
      $app.logger().warn('Customer record not found', 'stripe-portal', {
        user_id: userRecord.id,
        user_email: userRecord.get('email')
      });
      return e.json(404, { message: 'Customer not found' });
    }

    // Use the success URL from env, but remove the query parameter
    const baseReturnUrl = process.env.PB_STRIPE_SUCCESS_URL ? 
      process.env.PB_STRIPE_SUCCESS_URL.split('?')[0] : 
      'http://localhost:3000/dashboard/billing';
    
    console.log('🔗 Creating portal session for customer:', customerRecord.get('stripe_customer_id'));
    console.log('🔗 Return URL:', baseReturnUrl);
    $app.logger().info('Portal session creation attempt', 'stripe-portal', {
      customer_id: customerRecord.get('stripe_customer_id'),
      return_url: baseReturnUrl,
      user_id: userRecord.id
    });
    
    const response = await $http.send({
      url: 'https://api.stripe.com/v1/billing_portal/sessions',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${apiKey}`,
      },
      body: `customer=${encodeURIComponent(customerRecord.get('stripe_customer_id'))}&return_url=${encodeURIComponent(baseReturnUrl)}`,
    });

    if (response.json.error) {
      const errorDetails = JSON.stringify(response.json.error, null, 2);
      console.error('Error creating portal session:', errorDetails);
      $app.logger().error('Stripe portal session creation failed', 'stripe-portal', {
        error: response.json.error,
        status_code: response.statusCode,
        customer_id: customerRecord.get('stripe_customer_id'),
        user_id: userRecord.id
      });
      return e.json(400, {
        message: 'Failed to create portal session',
        error: response.json.error,
        details: response.json.error.message || 'Unknown error from Stripe API'
      });
    }

    return e.json(200, { url: response.json.url });
  } catch (error) {
    const errorDetails = JSON.stringify(error, null, 2);
    console.error('Error retrieving customer portal link:', errorDetails);
    $app.logger().error('Customer portal link retrieval failed', 'stripe-portal', {
      error: error.message || error,
      user_id: userRecord?.id || 'unknown',
      stack: error.stack
    });
    return e.json(400, { 
      message: 'Failed to retrieve customer portal link',
      details: error.message || 'Unknown server error'
    });
  }
});
