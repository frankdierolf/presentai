import type {
  PriceResponse,
  ProductResponse,
  SubscriptionResponse,
} from '@@/pocketbase-types';

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  status?: string;
  currentPeriodEnd?: string;
  currentPeriodStart?: string;
  amount: number;
  interval: string;
  priceId: string;
}

export interface ExpandedPrice extends PriceResponse {
  expand: {
    product_id: ProductResponse;
  };
}

export interface ExpandedSubscription extends SubscriptionResponse {
  expand: {
    price_id: PriceResponse;
  };
}
