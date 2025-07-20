/// <reference path="../pb_data/types.d.ts" />

// Product and Price sync cron job
// Runs daily to sync existing Stripe products and prices to PocketBase
// This is essential for populating the billing page with available plans

// Run once daily at 1 AM (before subscription sync at 2 AM)
cronAdd('product-price-sync', '0 1 * * *', () => {
  const productUtils = require(`${__hooks}/webhook-utils.js`);
  console.log('🛍️ Starting product and price sync...');
  $app.logger().info('Starting product and price sync job');
  
  const startTime = Date.now();
  let syncStats = {
    productsProcessed: 0,
    productsUpdated: 0,
    pricesProcessed: 0,
    pricesUpdated: 0,
    errors: 0
  };

  try {
    // Get Stripe secret key
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable not found');
    }

    // 1. Sync Products
    console.log('📦 Syncing products from Stripe...');
    
    const productsResponse = $http.send({
      method: 'GET',
      url: 'https://api.stripe.com/v1/products?limit=100&active=true',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (productsResponse.statusCode !== 200) {
      throw new Error(`Failed to fetch products from Stripe: ${productsResponse.statusCode}`);
    }

    const productsData = productsResponse.json;
    const stripeProducts = productsData.data || [];
    
    console.log(`📦 Found ${stripeProducts.length} products in Stripe`);
    
    for (const stripeProduct of stripeProducts) {
      try {
        syncStats.productsProcessed++;
        
        // Check if product exists in PocketBase
        let existingProduct;
        try {
          existingProduct = $app.findFirstRecordByData(
            'product',
            'product_id',
            stripeProduct.id
          );
        } catch (e) {
          existingProduct = null;
        }

        // Check if sync is needed
        const needsSync = !existingProduct || 
          existingProduct.getString('name') !== stripeProduct.name ||
          existingProduct.getBool('active') !== stripeProduct.active;

        if (needsSync) {
          console.log(`📦 Syncing product: ${stripeProduct.name} (${stripeProduct.id})`);
          
          // Use existing webhook handler for consistency
          productUtils.handleProductEvent(stripeProduct);
          syncStats.productsUpdated++;
          
          $app.logger().info(`Synced product: ${stripeProduct.id}`, 'product_sync', {
            product_id: stripeProduct.id,
            name: stripeProduct.name,
            sync_reason: !existingProduct ? 'missing' : 'data_change'
          });
        }

      } catch (productError) {
        console.error(`❌ Error syncing product ${stripeProduct.id}:`, productError);
        $app.logger().error(`Product sync error: ${stripeProduct.id}`, productError);
        syncStats.errors++;
      }
    }

    // 2. Sync Prices
    console.log('💰 Syncing prices from Stripe...');
    
    const pricesResponse = $http.send({
      method: 'GET',
      url: 'https://api.stripe.com/v1/prices?limit=100&active=true&expand[]=data.product',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (pricesResponse.statusCode !== 200) {
      throw new Error(`Failed to fetch prices from Stripe: ${pricesResponse.statusCode}`);
    }

    const pricesData = pricesResponse.json;
    const stripePrices = pricesData.data || [];
    
    console.log(`💰 Found ${stripePrices.length} prices in Stripe`);
    
    for (const stripePrice of stripePrices) {
      try {
        syncStats.pricesProcessed++;
        
        // Check if price exists in PocketBase
        let existingPrice;
        try {
          existingPrice = $app.findFirstRecordByData(
            'price',
            'price_id',
            stripePrice.id
          );
        } catch (e) {
          existingPrice = null;
        }

        // Check if sync is needed
        const needsSync = !existingPrice || 
          existingPrice.getInt('unit_amount') !== stripePrice.unit_amount ||
          existingPrice.getBool('active') !== stripePrice.active;

        if (needsSync) {
          console.log(`💰 Syncing price: ${stripePrice.id} (${stripePrice.unit_amount} ${stripePrice.currency})`);
          
          // Use existing webhook handler for consistency
          productUtils.handlePriceEvent(stripePrice);
          syncStats.pricesUpdated++;
          
          $app.logger().info(`Synced price: ${stripePrice.id}`, 'price_sync', {
            price_id: stripePrice.id,
            unit_amount: stripePrice.unit_amount,
            currency: stripePrice.currency,
            product_id: stripePrice.product,
            sync_reason: !existingPrice ? 'missing' : 'data_change'
          });
        }

      } catch (priceError) {
        console.error(`❌ Error syncing price ${stripePrice.id}:`, priceError);
        $app.logger().error(`Price sync error: ${stripePrice.id}`, priceError);
        syncStats.errors++;
      }
    }

    const duration = Date.now() - startTime;
    const summary = `✅ Product/Price sync completed in ${duration}ms. Stats: ${syncStats.productsProcessed} products (${syncStats.productsUpdated} updated), ${syncStats.pricesProcessed} prices (${syncStats.pricesUpdated} updated), ${syncStats.errors} errors`;
    
    console.log(summary);
    $app.logger().info('Product/Price sync job completed', 'product_price_sync', {
      duration_ms: duration,
      ...syncStats
    });

  } catch (error) {
    const errorMessage = `❌ Product/Price sync job failed: ${error.message}`;
    console.error(errorMessage);
    $app.logger().error('Product/Price sync job failed', error);
  }
});

// Manual trigger endpoint for immediate sync
routerAdd('GET', '/admin/sync-products-prices', (e) => {
  // Only allow for authenticated admin users
  const authRecord = e.requestInfo().authRecord;
  if (!authRecord || authRecord.collection().name !== '_superusers') {
    throw new ForbiddenError('Admin access required');
  }

  console.log('🔧 Manual product/price sync triggered by admin');
  
  try {
    const productUtils = require(`${__hooks}/webhook-utils.js`);
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      return e.json(500, { 
        error: 'STRIPE_SECRET_KEY not configured',
        timestamp: new Date().toISOString()
      });
    }

    let results = {
      products: { synced: 0, errors: 0 },
      prices: { synced: 0, errors: 0 }
    };

    // Sync products
    const productsResponse = $http.send({
      method: 'GET',
      url: 'https://api.stripe.com/v1/products?limit=100&active=true',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`
      }
    });

    if (productsResponse.statusCode === 200) {
      const products = productsResponse.json.data || [];
      for (const product of products) {
        try {
          productUtils.handleProductEvent(product);
          results.products.synced++;
        } catch (err) {
          results.products.errors++;
          console.error(`Product sync error: ${product.id}`, err);
        }
      }
    }

    // Sync prices
    const pricesResponse = $http.send({
      method: 'GET',
      url: 'https://api.stripe.com/v1/prices?limit=100&active=true',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`
      }
    });

    if (pricesResponse.statusCode === 200) {
      const prices = pricesResponse.json.data || [];
      for (const price of prices) {
        try {
          productUtils.handlePriceEvent(price);
          results.prices.synced++;
        } catch (err) {
          results.prices.errors++;
          console.error(`Price sync error: ${price.id}`, err);
        }
      }
    }

    return e.json(200, {
      message: 'Manual product/price sync completed',
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Manual sync failed:', error);
    return e.json(500, {
      error: 'Sync failed: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});