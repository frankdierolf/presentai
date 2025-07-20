module.exports = {
  async createOrGetCustomer(userRecord, apiKey) {
    const existingCustomer = $app.findRecordsByFilter(
      'customer',
      `user_id = "${userRecord.id}"`
    );

    if (existingCustomer.length > 0) {
      return existingCustomer[0].getString('stripe_customer_id');
    }

    const customerResponse = await $http.send({
      url: 'https://api.stripe.com/v1/customers',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${apiKey}`,
      },
      body: `email=${encodeURIComponent(
        userRecord.getString('email')
      )}&name=${encodeURIComponent(
        userRecord.getString('name')
      )}&metadata[pocketbaseUUID]=${encodeURIComponent(userRecord.id)}`,
    });

    const customerId = customerResponse.json.id;

    const collection = $app.findCollectionByNameOrId('customer');
    let customerRecord;
    try {
      customerRecord = $app.findFirstRecordByData(
        'customer',
        'stripe_customer_id',
        customerId
      );
    } catch (e) {
      customerRecord = new Record(collection);
    }

    customerRecord.set('stripe_customer_id', customerId);
    customerRecord.set('user_id', userRecord.id);

    $app.save(customerRecord);
    return customerId;
  },

  createSessionParams(customerId, priceInfo, quantity = 1) {
    const lineParams = [
      {
        price: priceInfo.id,
        quantity: quantity,
      },
    ];

    const params = {
      customer: customerId,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
      },
      allow_promotion_codes: true,
      success_url: process.env.PB_STRIPE_SUCCESS_URL,
      cancel_url: process.env.PB_STRIPE_CANCEL_URL,
      line_items: lineParams.map((item) => ({
        price: item.price,
        quantity: item.quantity,
      })),
      mode: priceInfo.type === 'recurring' ? 'subscription' : 'payment',
    };

    return params;
  },

  formatRequestBody(params) {
    return Object.entries(params)
      .flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          return value
            .map((v, i) =>
              Object.entries(v)
                .map(
                  ([subKey, subValue]) =>
                    `${encodeURIComponent(
                      `${key}[${i}][${subKey}]`
                    )}=${encodeURIComponent(subValue)}`
                )
                .join('&')
            )
            .join('&');
        } else if (typeof value === 'object' && value !== null) {
          return Object.entries(value)
            .map(
              ([subKey, subValue]) =>
                `${encodeURIComponent(
                  `${key}[${subKey}]`
                )}=${encodeURIComponent(subValue)}`
            )
            .join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('&');
  },
};
