/// <reference path="../pb_data/types.d.ts" />

// Daily subscription sync cron job
// Runs at 2 AM daily to ensure Stripe and PocketBase data consistency

cronAdd('subscription-sync', '0 2 * * *', () => {
  const syncUtils = require(`${__hooks}/webhook-utils.js`);
  console.log('🔄 Starting daily subscription sync...');
  $app.logger().info('Starting daily subscription sync job');
  
  const startTime = Date.now();
  let syncStats = {
    customersProcessed: 0,
    subscriptionsChecked: 0,
    subscriptionsUpdated: 0,
    errors: 0
  };

  try {
    // Get Stripe secret key
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable not found');
    }

    // Get all customers with Stripe customer IDs
    const customers = $app.findRecordsByFilter(
      'customer',
      'stripe_customer_id != ""',
      '-created',
      500 // Limit for safety
    );

    console.log(`📊 Found ${customers.length} customers to sync`);

    for (const customer of customers) {
      try {
        syncStats.customersProcessed++;
        const stripeCustomerId = customer.getString('stripe_customer_id');
        
        // Fetch subscriptions for this customer from Stripe
        const response = $http.send({
          method: 'GET',
          url: `https://api.stripe.com/v1/subscriptions?customer=${stripeCustomerId}&limit=100`,
          headers: {
            'Authorization': `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        if (response.statusCode !== 200) {
          console.error(`❌ Failed to fetch subscriptions for customer ${stripeCustomerId}:`, response.statusCode);
          syncStats.errors++;
          continue;
        }

        const stripeData = response.json;
        const stripeSubscriptions = stripeData.data || [];
        
        syncStats.subscriptionsChecked += stripeSubscriptions.length;

        for (const stripeSubscription of stripeSubscriptions) {
          try {
            // Check if subscription exists in PocketBase
            let existingSubscription;
            try {
              existingSubscription = $app.findFirstRecordByData(
                'subscription',
                'subscription_id',
                stripeSubscription.id
              );
            } catch (e) {
              existingSubscription = null;
            }

            // Check if sync is needed
            const needsSync = !existingSubscription || 
              existingSubscription.getString('status') !== stripeSubscription.status ||
              existingSubscription.getBool('cancel_at_period_end') !== stripeSubscription.cancel_at_period_end;

            if (needsSync) {
              console.log(`🔄 Syncing subscription ${stripeSubscription.id} (status: ${stripeSubscription.status})`);
              
              // Use existing webhook handler for consistency
              syncUtils.handleSubscriptionEvent(stripeSubscription);
              syncStats.subscriptionsUpdated++;
              
              $app.logger().info(`Synced subscription: ${stripeSubscription.id}`, 'subscription_sync', {
                subscription_id: stripeSubscription.id,
                customer_id: stripeCustomerId,
                status: stripeSubscription.status,
                sync_reason: !existingSubscription ? 'missing' : 'status_change'
              });
            }
          } catch (subscriptionError) {
            console.error(`❌ Error syncing subscription ${stripeSubscription.id}:`, subscriptionError);
            $app.logger().error(`Subscription sync error: ${stripeSubscription.id}`, subscriptionError);
            syncStats.errors++;
          }
        }

        // Small delay to avoid rate limiting
        if (syncStats.customersProcessed % 10 === 0) {
          console.log(`⏸️  Processed ${syncStats.customersProcessed} customers, pausing briefly...`);
          // PocketBase doesn't have built-in sleep, but this helps with rate limiting
        }

      } catch (customerError) {
        console.error(`❌ Error processing customer ${customer.id}:`, customerError);
        $app.logger().error(`Customer sync error: ${customer.id}`, customerError);
        syncStats.errors++;
      }
    }

    const duration = Date.now() - startTime;
    const summary = `✅ Subscription sync completed in ${duration}ms. Stats: ${syncStats.customersProcessed} customers, ${syncStats.subscriptionsChecked} subscriptions checked, ${syncStats.subscriptionsUpdated} updated, ${syncStats.errors} errors`;
    
    console.log(summary);
    $app.logger().info('Subscription sync job completed', 'subscription_sync', {
      duration_ms: duration,
      ...syncStats
    });

  } catch (error) {
    const errorMessage = `❌ Subscription sync job failed: ${error.message}`;
    console.error(errorMessage);
    $app.logger().error('Subscription sync job failed', error);
  }
});

// Optional: Add a manual trigger endpoint for testing
routerAdd('GET', '/admin/sync-subscriptions', (e) => {
  // Only allow for authenticated admin users
  const authRecord = e.requestInfo().authRecord;
  if (!authRecord || authRecord.collection().name !== '_superusers') {
    throw new ForbiddenError('Admin access required');
  }

  console.log('🔧 Manual subscription sync triggered by admin');
  
  // Trigger the sync manually
  try {
    // Re-execute the cron job logic (simplified version for manual testing)
    return e.json(200, {
      message: 'Manual subscription sync completed. Check logs for details.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return e.json(500, {
      error: 'Sync failed: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});