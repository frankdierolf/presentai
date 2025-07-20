import type {
  ExpandedPrice,
  ExpandedSubscription,
  BillingPlan,
} from '~/types/billing';

export const useBilling = () => {
  const { pb, user } = usePocketbase();
  const plans = ref<ExpandedPrice[]>([]);
  const isLoading = ref(true);
  const loadingPriceId = ref<string | null>(null);
  const currentSubscription = ref<ExpandedSubscription | null>(null);
  const isLoadingBillingPortal = ref(false);

  const fetchProducts = async () => {
    try {
      isLoading.value = true;
      const prices = await pb.collection('price').getFullList<ExpandedPrice>({
        sort: 'created',
        expand: 'product_id',
      });
      plans.value = prices;
    } catch (error) {
      console.error(error);
      throw createError('Failed to fetch products');
    } finally {
      isLoading.value = false;
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const subscription = await pb
        .collection('subscription')
        .getFirstListItem<ExpandedSubscription>('status = "active" || status = "trialing" || status = "past_due"', {
          expand: 'price_id',
        });
      currentSubscription.value = subscription;
    } catch (error) {
      if (error.status === 404) {
        currentSubscription.value = null;
      } else {
        console.error(error);
        throw createError('Failed to fetch current subscription');
      }
    }
  };

  const createCheckoutSession = async (priceId: string) => {
    try {
      if (user.value?.pro_account) {
        await handleManageBilling();
        return;
      }
      loadingPriceId.value = priceId;
      const session = await $fetch<{ url: string }>(
        `${useRuntimeConfig().public.pocketbaseUrl}/create-checkout-session`,
        {
          method: 'POST',
          body: {
            price: {
              id: priceId,
              type: 'recurring',
            },
          },
          headers: {
            Authorization: pb.authStore.token,
          },
        }
      );
      window.location.href = session.url;
    } catch (error) {
      console.error(error);
      throw createError('Failed to create checkout session');
    } finally {
      loadingPriceId.value = null;
    }
  };

  const currentPlan = computed<BillingPlan>(() => {
    if (!currentSubscription.value?.price_id || !plans.value) {
      return {
        id: '',
        name: 'No active plan',
        description: '',
        amount: 0,
        interval: '',
        priceId: '',
      };
    }

    const plan = plans.value.find(
      (p) => p.id === currentSubscription.value?.price_id
    );

    if (!plan) {
      throw createError('Invalid plan configuration');
    }

    return {
      id: plan.id,
      name: plan.expand?.product_id?.name || 'Unknown plan',
      description: plan.expand?.product_id?.description || 'No description',
      status: currentSubscription.value.status,
      currentPeriodEnd: currentSubscription.value.current_period_end,
      currentPeriodStart: currentSubscription.value.current_period_start,
      amount: plan.unit_amount,
      interval: plan.interval,
      priceId: plan.price_id,
    };
  });

  const isActivePlan = (planId: string): boolean => {
    return currentSubscription.value?.expand?.price_id?.price_id === planId;
  };

  const formatPrice = (price?: number): string => {
    if (!price) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const handleManageBilling = async () => {
    try {
      isLoadingBillingPortal.value = true;
      const session = await $fetch<{ url: string }>(
        `${useRuntimeConfig().public.pocketbaseUrl}/create-portal-link`,
        {
          headers: {
            Authorization: pb.authStore.token || '',
          },
        }
      );

      if (!session || !session.url) {
        throw createError('Invalid response from billing portal');
      }

      window.location.href = session.url;
    } catch (error) {
      console.error('Failed to access billing portal:', error);
      throw createError(
        'Unable to access billing portal. Please try again later.'
      );
    } finally {
      isLoadingBillingPortal.value = false;
    }
  };

  return {
    plans,
    fetchProducts,
    isLoading,
    createCheckoutSession,
    loadingPriceId,
    fetchCurrentSubscription,
    currentSubscription,
    currentPlan,
    isActivePlan,
    formatPrice,
    handleManageBilling,
    isLoadingBillingPortal,
  };
};
