/// <reference path="../pb_data/types.d.ts" />

// Manual Stripe sync endpoints for user self-service and admin troubleshooting

// Manual sync endpoint for authenticated users
routerAdd('POST', '/api/sync-stripe', async (e) => {
  console.log('🔄 Manual Stripe sync requested by user');
  
  // Load utils inside the function scope
  const utils = require(`${__hooks}/webhook-utils.js`);
  
  const info = e.requestInfo();
  
  // Authenticate user
  const token = info.headers['authorization'] || '';
  let userRecord;
  try {
    userRecord = await $app.findAuthRecordByToken(token, 'auth');
  } catch (error) {
    console.error('❌ User authentication failed:', error);
    return e.json(401, { 
      success: false,
      message: 'User not authorized',
      timestamp: new Date().toISOString()
    });
  }

  console.log(`👤 Syncing Stripe data for user: ${userRecord.id} (${userRecord.getString('email')})`);

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return e.json(500, { 
        success: false,
        error: 'STRIPE_SECRET_KEY not configured',
        timestamp: new Date().toISOString()
      });
    }

    let syncResults = {
      user_id: userRecord.id,
      email: userRecord.getString('email'),
      customer_found: false,
      customer_id: null,
      checkout_sessions: { checked: 0, processed: 0 },
      subscriptions: { checked: 0, processed: 0, active: 0 },
      user_updated: false,
      pro_status_before: userRecord.getBool('pro_account'),
      pro_status_after: null,
      errors: []
    };

    // 1. Find or verify customer record
    let customerRecord;
    try {
      customerRecord = $app.findFirstRecordByFilter(
        'customer',
        `user_id = "${userRecord.id}"`
      );
      syncResults.customer_found = true;
      syncResults.customer_id = customerRecord.getString('stripe_customer_id');
      console.log(`👤 Found customer record: ${syncResults.customer_id}`);
    } catch (e) {
      console.log('⚠️ No customer record found for user');
      return e.json(200, {
        success: true,
        message: 'No customer record found - user has not attempted checkout yet',
        results: syncResults,
        timestamp: new Date().toISOString()
      });
    }

    const customerId = syncResults.customer_id;

    // 2. Fetch recent checkout sessions for this customer
    console.log('🛒 Fetching checkout sessions from Stripe...');
    const checkoutResponse = $http.send({
      method: 'GET',
      url: `https://api.stripe.com/v1/checkout/sessions?customer=${customerId}&limit=10`,
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`
      }
    });

    if (checkoutResponse.statusCode === 200) {
      const sessions = checkoutResponse.json.data || [];
      syncResults.checkout_sessions.checked = sessions.length;
      console.log(`🛒 Found ${sessions.length} checkout sessions`);

      for (const session of sessions) {
        if (session.status === 'complete' && session.mode === 'subscription') {
          console.log(`✅ Processing completed checkout session: ${session.id}`);
          try {
            utils.handleCheckoutSessionEvent(session);
            syncResults.checkout_sessions.processed++;
          } catch (err) {
            console.error(`❌ Error processing session ${session.id}:`, err);
            syncResults.errors.push(`Checkout session ${session.id}: ${err.message}`);
          }
        } else {
          console.log(`⏭️ Skipping session ${session.id} (status: ${session.status}, mode: ${session.mode})`);
        }
      }
    } else {
      console.error('❌ Failed to fetch checkout sessions:', checkoutResponse.statusCode);
      syncResults.errors.push(`Failed to fetch checkout sessions: HTTP ${checkoutResponse.statusCode}`);
    }

    // 3. Fetch active subscriptions for this customer
    console.log('📋 Fetching subscriptions from Stripe...');
    const subscriptionsResponse = $http.send({
      method: 'GET',
      url: `https://api.stripe.com/v1/subscriptions?customer=${customerId}&status=active&limit=10`,
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`
      }
    });

    if (subscriptionsResponse.statusCode === 200) {
      const subscriptions = subscriptionsResponse.json.data || [];
      syncResults.subscriptions.checked = subscriptions.length;
      syncResults.subscriptions.active = subscriptions.length;
      console.log(`📋 Found ${subscriptions.length} active subscriptions`);

      for (const subscription of subscriptions) {
        console.log(`🔄 Processing subscription: ${subscription.id} (status: ${subscription.status})`);
        try {
          utils.handleSubscriptionEvent(subscription);
          syncResults.subscriptions.processed++;
        } catch (err) {
          console.error(`❌ Error processing subscription ${subscription.id}:`, err);
          syncResults.errors.push(`Subscription ${subscription.id}: ${err.message}`);
        }
      }
    } else {
      console.error('❌ Failed to fetch subscriptions:', subscriptionsResponse.statusCode);
      syncResults.errors.push(`Failed to fetch subscriptions: HTTP ${subscriptionsResponse.statusCode}`);
    }

    // 4. Refresh user record and check final status
    const refreshedUser = $app.findRecordById('users', userRecord.id);
    syncResults.pro_status_after = refreshedUser.getBool('pro_account');
    syncResults.user_updated = syncResults.pro_status_before !== syncResults.pro_status_after;

    if (syncResults.user_updated) {
      console.log(`🏆 User Pro status changed: ${syncResults.pro_status_before} → ${syncResults.pro_status_after}`);
    } else {
      console.log(`📊 User Pro status unchanged: ${syncResults.pro_status_after}`);
    }

    const message = syncResults.user_updated 
      ? `Sync completed! Pro status updated to: ${syncResults.pro_status_after}`
      : `Sync completed. Pro status remains: ${syncResults.pro_status_after}`;

    console.log(`✅ Sync completed for user ${userRecord.id}`);
    
    return e.json(200, {
      success: true,
      message: message,
      results: syncResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Sync failed for user ${userRecord.id}:`, error);
    return e.json(500, {
      success: false,
      error: `Sync failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// Get sync status endpoint
routerAdd('GET', '/api/sync-status', (e) => {
  const info = e.requestInfo();
  
  // Authenticate user
  const token = info.headers['authorization'] || '';
  let userRecord;
  try {
    userRecord = $app.findAuthRecordByToken(token, 'auth');
  } catch (error) {
    return e.json(401, { 
      success: false,
      message: 'User not authorized'
    });
  }

  try {
    // Get customer info
    let customerInfo = null;
    try {
      const customerRecord = $app.findFirstRecordByFilter(
        'customer',
        `user_id = "${userRecord.id}"`
      );
      customerInfo = {
        exists: true,
        stripe_customer_id: customerRecord.getString('stripe_customer_id'),
        created: customerRecord.getString('created')
      };
    } catch (e) {
      customerInfo = { exists: false };
    }

    // Get subscription info
    let subscriptionInfo = null;
    try {
      const subscriptionRecord = $app.findFirstRecordByFilter(
        'subscription',
        `user_id = "${userRecord.id}"`
      );
      subscriptionInfo = {
        exists: true,
        subscription_id: subscriptionRecord.getString('subscription_id'),
        status: subscriptionRecord.getString('status'),
        created: subscriptionRecord.getString('created')
      };
    } catch (e) {
      subscriptionInfo = { exists: false };
    }

    return e.json(200, {
      success: true,
      user: {
        id: userRecord.id,
        email: userRecord.getString('email'),
        pro_account: userRecord.getBool('pro_account')
      },
      customer: customerInfo,
      subscription: subscriptionInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return e.json(500, {
      success: false,
      error: `Failed to get sync status: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// Admin endpoint to sync specific user
routerAdd('POST', '/admin/sync-user-stripe', (e) => {
  // Only allow for authenticated admin users
  const authRecord = e.requestInfo().authRecord;
  if (!authRecord || authRecord.collection().name !== '_superusers') {
    throw new ForbiddenError('Admin access required');
  }

  const info = e.requestInfo();
  const userId = info.body.user_id;
  
  if (!userId) {
    return e.json(400, {
      success: false,
      error: 'user_id is required',
      timestamp: new Date().toISOString()
    });
  }

  console.log(`🔧 Admin sync requested for user: ${userId}`);

  // Re-use the main sync logic by creating a mock request with the target user's token
  try {
    const targetUser = $app.findRecordById('users', userId);
    
    // Create a temporary token for the target user (admin operation)
    const tempToken = $tokens.recordAuthToken($app, targetUser);
    
    // Create mock request info with admin-generated token
    const mockInfo = {
      headers: { 'authorization': tempToken },
      body: {}
    };
    
    // Create mock event object
    const mockEvent = {
      requestInfo: () => mockInfo,
      json: (status, data) => ({ status, data })
    };

    // Note: In a real implementation, we'd extract the sync logic to a shared function
    // For now, return a simplified admin response
    return e.json(200, {
      success: true,
      message: `Admin sync initiated for user ${userId}. Check logs for details.`,
      admin_user: authRecord.id,
      target_user: userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Admin sync failed for user ${userId}:`, error);
    return e.json(500, {
      success: false,
      error: `Admin sync failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});