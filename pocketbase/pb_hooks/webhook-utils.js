module.exports = {
  parseStripeSignature: (signature) => {
    return signature.split(',').reduce((accum, x) => {
      const [k, v] = x.split('=');
      return { ...accum, [k]: v };
    }, {});
  },

  validateWebhookSignature: (signature, rawBody, secret) => {
    const hash = $security.hs256(`${signature.t}.${rawBody}`, secret);
    return $security.equal(hash, signature.v1);
  },

  handleProductEvent: (product) => {
    const collection = $app.findCollectionByNameOrId('product');
    let record;

    try {
      record = $app.findFirstRecordByData('product', 'product_id', product.id);
    } catch (e) {
      record = new Record(collection);
    }

    record.set('product_id', product.id);
    record.set('active', product.active);
    record.set('name', product.name);
    record.set('description', product.description || '');
    record.set('metadata', product.metadata || {});
    record.set('features', product.marketing_features || []);

    $app.save(record);
  },

  handlePriceEvent: (price) => {
    const collection = $app.findCollectionByNameOrId('price');
    let record;

    try {
      record = $app.findFirstRecordByData('price', 'price_id', price.id);
    } catch (e) {
      record = new Record(collection);
    }

    // Handle price.product which can be either a string ID or an expanded object
    const productId = typeof price.product === 'object' ? price.product.id : price.product;
    
    let product;
    try {
      product = $app.findFirstRecordByData(
        'product',
        'product_id',
        productId
      );
    } catch (error) {
      console.error('Error finding product:', error);
      console.error('Product ID:', productId);
    }

    record.set('price_id', price.id);
    record.set('stripe_product_id', productId);
    record.set('product_id', product ? product.id : '');
    record.set('active', price.active);
    record.set('currency', price.currency);
    record.set('description', price.nickname || '');
    record.set('type', price.type);
    record.set('unit_amount', price.unit_amount);
    record.set('metadata', price.metadata || {});

    if (price.recurring) {
      record.set('interval', price.recurring.interval);
      record.set('interval_count', price.recurring.interval_count);
      record.set('trial_period_days', price.recurring.trial_period_days);
    }

    $app.save(record);
  },

  handleSubscriptionEvent: (subscription) => {
    console.log(`🔄 Processing subscription: ${subscription.id} (status: ${subscription.status})`);
    console.log(`📅 Key dates - created: ${subscription.created}, current_period_start: ${subscription.current_period_start}, current_period_end: ${subscription.current_period_end}`);
    console.log(`🚫 Cancelation dates - cancel_at: ${subscription.cancel_at}, canceled_at: ${subscription.canceled_at}, ended_at: ${subscription.ended_at}`);
    
    const existingCustomer = $app.findFirstRecordByData(
      'customer',
      'stripe_customer_id',
      subscription.customer
    );

    if (!existingCustomer) {
      console.error('❌ No customer found for subscription:', subscription.id);
      throw new BadRequestError('No customer found for subscription.');
    }

    const uuid = existingCustomer.get('user_id');
    console.log(`👤 Found customer for user: ${uuid}`);
    
    const collection = $app.findCollectionByNameOrId('subscription');
    let priceRecord;
    try {
      priceRecord = $app.findFirstRecordByData(
        'price',
        'price_id',
        subscription.items.data[0].price.id
      );
      console.log(`💰 Found price record: ${priceRecord.id}`);
    } catch (e) {
      console.error('❌ Error finding price record:', e);
      throw e;
    }
    let record;

    try {
      record = $app.findFirstRecordByData(
        'subscription',
        'subscription_id',
        subscription.id
      );
    } catch (e) {
      record = new Record(collection);
    }

    record.set('subscription_id', subscription.id);
    record.set('user_id', uuid);
    record.set('metadata', subscription.metadata || {});
    record.set('status', subscription.status);
    record.set('price_id', priceRecord.id);
    record.set('quantity', subscription.items.data[0].quantity);
    record.set('cancel_at_period_end', subscription.cancel_at_period_end);
    record.set(
      'cancel_at',
      subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : ''
    );
    record.set(
      'canceled_at',
      subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : ''
    );
    record.set(
      'current_period_start',
      subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000).toISOString()
        : ''
    );
    record.set(
      'current_period_end',
      subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : ''
    );
    record.set(
      'created',
      subscription.created
        ? new Date(subscription.created * 1000).toISOString()
        : ''
    );
    record.set(
      'ended_at',
      subscription.ended_at
        ? new Date(subscription.ended_at * 1000).toISOString()
        : ''
    );
    record.set(
      'trial_start',
      subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : ''
    );
    record.set(
      'trial_end',
      subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : ''
    );

    console.log(`💾 Saving subscription record: ${subscription.id}`);
    $app.save(record);

    console.log(`👤 Updating user record for: ${uuid}`);
    const existingUserRecord = $app.findFirstRecordByData('users', 'id', uuid);
    const existingSubscriptionRecord = $app.findFirstRecordByData(
      'subscription',
      'subscription_id',
      subscription.id
    );
    existingUserRecord.set(
      'billing_address',
      subscription.default_payment_method?.customer?.address || ''
    );
    existingUserRecord.set(
      'payment_method',
      subscription.default_payment_method?.type || ''
    );
    
    const isActive = subscription.status === 'active';
    console.log(`🏆 Setting pro_account to: ${isActive} (subscription status: ${subscription.status})`);
    existingUserRecord.set('pro_account', isActive);
    existingUserRecord.set('subscription', existingSubscriptionRecord.id);
    $app.save(existingUserRecord);
    
    console.log(`✅ Successfully processed subscription: ${subscription.id} for user: ${uuid}`);
  },

  handleCheckoutSessionEvent: (session) => {
    if (session.mode !== 'subscription') {
      return; // Only handle subscription checkouts
    }

    const existingCustomer = $app.findFirstRecordByData(
      'customer',
      'stripe_customer_id',
      session.customer
    );

    if (!existingCustomer) {
      throw new BadRequestError('No customer found for subscription.');
    }

    const subscriptionResponse = $http.send({
      method: 'GET',
      url: `https://api.stripe.com/v1/subscriptions/${session.subscription}`,
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
      }
    });

    if (subscriptionResponse.statusCode !== 200) {
      throw new BadRequestError('Failed to fetch subscription details from Stripe');
    }

    const subscription = JSON.parse(subscriptionResponse.raw);
    
    module.exports.handleSubscriptionEvent(subscription);
  },
};
