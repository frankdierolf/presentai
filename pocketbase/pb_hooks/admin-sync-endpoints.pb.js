/// <reference path="../pb_data/types.d.ts" />

// Admin endpoints for manual data synchronization
// These endpoints allow admins to trigger immediate sync of Stripe data

// Trigger all sync operations at once
routerAdd('POST', '/admin/sync-all', (e) => {
  // Only allow for authenticated admin users
  const authRecord = e.requestInfo().authRecord;
  if (!authRecord || authRecord.collection().name !== '_superusers') {
    throw new ForbiddenError('Admin access required');
  }

  console.log('🔧 Manual full sync triggered by admin');
  
  try {
    const adminUtils = require(`${__hooks}/webhook-utils.js`);
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      return e.json(500, { 
        error: 'STRIPE_SECRET_KEY not configured',
        timestamp: new Date().toISOString()
      });
    }

    let results = {
      products: { synced: 0, errors: 0 },
      prices: { synced: 0, errors: 0 },
      customers: { synced: 0, errors: 0 }
    };

    console.log('📦 Syncing products...');
    
    // 1. Sync products
    const productsResponse = $http.send({
      method: 'GET',
      url: 'https://api.stripe.com/v1/products?limit=100&active=true',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`
      }
    });

    if (productsResponse.statusCode === 200) {
      const products = productsResponse.json.data || [];
      console.log(`Found ${products.length} products in Stripe`);
      
      for (const product of products) {
        try {
          adminUtils.handleProductEvent(product);
          results.products.synced++;
          console.log(`✅ Synced product: ${product.name}`);
        } catch (err) {
          results.products.errors++;
          console.error(`❌ Product sync error: ${product.id}`, err);
        }
      }
    }

    console.log('💰 Syncing prices...');

    // 2. Sync prices
    const pricesResponse = $http.send({
      method: 'GET',
      url: 'https://api.stripe.com/v1/prices?limit=100&active=true',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`
      }
    });

    if (pricesResponse.statusCode === 200) {
      const prices = pricesResponse.json.data || [];
      console.log(`Found ${prices.length} prices in Stripe`);
      
      for (const price of prices) {
        try {
          adminUtils.handlePriceEvent(price);
          results.prices.synced++;
          console.log(`✅ Synced price: ${price.id} (${price.unit_amount} ${price.currency})`);
        } catch (err) {
          results.prices.errors++;
          console.error(`❌ Price sync error: ${price.id}`, err);
        }
      }
    }

    console.log('👥 Syncing customers and subscriptions...');

    // 3. Sync customers and their subscriptions
    const customersResponse = $http.send({
      method: 'GET',
      url: 'https://api.stripe.com/v1/customers?limit=100',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`
      }
    });

    if (customersResponse.statusCode === 200) {
      const customers = customersResponse.json.data || [];
      console.log(`Found ${customers.length} customers in Stripe`);
      
      for (const customer of customers) {
        try {
          // Check if customer has a pocketbaseUUID in metadata
          const pocketbaseUUID = customer.metadata?.pocketbaseUUID;
          if (pocketbaseUUID) {
            // Check if user exists in PocketBase
            let userRecord;
            try {
              userRecord = $app.findRecordById('users', pocketbaseUUID);
            } catch (e) {
              console.log(`⚠️ User ${pocketbaseUUID} not found for customer ${customer.id}`);
              continue;
            }

            // Create or update customer record in PocketBase
            const collection = $app.findCollectionByNameOrId('customer');
            let customerRecord;
            try {
              customerRecord = $app.findFirstRecordByData(
                'customer',
                'stripe_customer_id',
                customer.id
              );
            } catch (e) {
              customerRecord = new Record(collection);
            }

            customerRecord.set('stripe_customer_id', customer.id);
            customerRecord.set('user_id', pocketbaseUUID);
            $app.save(customerRecord);

            results.customers.synced++;
            console.log(`✅ Synced customer: ${customer.email} -> ${pocketbaseUUID}`);

            // Fetch and sync subscriptions for this customer
            const subscriptionsResponse = $http.send({
              method: 'GET',
              url: `https://api.stripe.com/v1/subscriptions?customer=${customer.id}&limit=100`,
              headers: {
                'Authorization': `Bearer ${stripeSecretKey}`
              }
            });

            if (subscriptionsResponse.statusCode === 200) {
              const subscriptions = subscriptionsResponse.json.data || [];
              for (const subscription of subscriptions) {
                try {
                  adminUtils.handleSubscriptionEvent(subscription);
                  console.log(`✅ Synced subscription: ${subscription.id} for customer ${customer.email}`);
                } catch (subErr) {
                  console.error(`❌ Subscription sync error: ${subscription.id}`, subErr);
                }
              }
            }
          }
        } catch (err) {
          results.customers.errors++;
          console.error(`❌ Customer sync error: ${customer.id}`, err);
        }
      }
    }

    const summary = `✅ Full sync completed! Products: ${results.products.synced} synced, Prices: ${results.prices.synced} synced, Customers: ${results.customers.synced} synced`;
    console.log(summary);

    return e.json(200, {
      message: 'Full sync completed successfully',
      results: results,
      summary: summary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMsg = `❌ Full sync failed: ${error.message}`;
    console.error(errorMsg);
    return e.json(500, {
      error: errorMsg,
      timestamp: new Date().toISOString()
    });
  }
});

// Get sync status - shows current data counts
routerAdd('GET', '/admin/sync-status', (e) => {
  // Only allow for authenticated admin users
  const authRecord = e.requestInfo().authRecord;
  if (!authRecord || authRecord.collection().name !== '_superusers') {
    throw new ForbiddenError('Admin access required');
  }

  try {
    const productCount = $app.findRecordsByFilter('product', '', '', 1000).length;
    const priceCount = $app.findRecordsByFilter('price', '', '', 1000).length;
    const customerCount = $app.findRecordsByFilter('customer', '', '', 1000).length;
    const subscriptionCount = $app.findRecordsByFilter('subscription', '', '', 1000).length;
    const userCount = $app.findRecordsByFilter('users', '', '', 1000).length;

    return e.json(200, {
      pocketbase_data: {
        products: productCount,
        prices: priceCount,
        customers: customerCount,
        subscriptions: subscriptionCount,
        users: userCount
      },
      stripe_configured: process.env.STRIPE_SECRET_KEY ? true : false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return e.json(500, {
      error: 'Failed to get sync status: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});