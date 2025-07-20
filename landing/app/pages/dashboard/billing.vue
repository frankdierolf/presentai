<template>
  <AppContainer
    :loading="isLoading"
    title="Billing"
    description="Manage your billing information and subscription plans."
  >
    <template #actions>
      <UButton
        :loading="isSyncing"
        :disabled="!canSync"
        @click="handleSync"
        size="sm"
        icon="i-heroicons-arrow-path"
        variant="soft"
      >
        {{ isSyncing ? 'Syncing...' : 'Sync' }}
      </UButton>
    </template>

    <!-- Error Display (only when there's an error) -->
    <UAlert
      v-if="syncError"
      color="red"
      variant="soft"
      :title="syncError"
      class="mb-6"
      @close="clearSyncState"
    />

    <AppBillingActiveSubscriptionDetails v-if="currentSubscription" />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <div v-for="plan in plans" :key="plan.id">
        <AppBillingPricingCard
          :title="plan.expand?.product_id?.name || 'Subscription Plan'"
          :description="plan.expand?.product_id?.description || ''"
          :unit-amount="plan.unit_amount"
          :interval="plan.interval"
          :price-id="plan.price_id"
          :features="plan.expand?.product_id?.features || []"
          :loading="loadingPriceId === plan.price_id"
          :active="isActivePlan(plan.price_id)"
          @subscribe="createCheckoutSession(plan.price_id)"
        />
      </div>
    </div>
  </AppContainer>
</template>

<script setup lang="ts">
import { usePocketbase } from '@/composables/usePocketbase';

const route = useRoute();

const {
  plans,
  fetchProducts,
  isLoading,
  createCheckoutSession,
  loadingPriceId,
  currentSubscription,
  fetchCurrentSubscription,
  currentPlan,
  isActivePlan,
} = useBilling();

const {
  isSyncing,
  lastSyncResult,
  syncError,
  syncStatus,
  syncWithStripe,
  getSyncStatus,
  clearSyncState,
  hasCustomer,
  hasSubscription,
  isProUser,
  canSync,
  syncSummary,
} = useStripeSync();

const { refreshUser } = usePocketbase();

const handleSync = async () => {
  try {
    const result = await syncWithStripe();
    
    if (result.success) {
      // Refresh all billing data after successful sync
      await Promise.all([
        fetchProducts(),
        fetchCurrentSubscription(),
        refreshUser(),
        getSyncStatus()
      ]);
      
      // Show success toast
      const toast = useToast();
      toast.add({
        title: 'Sync completed!',
        description: result.message,
        color: 'green',
        timeout: 5000
      });
    } else {
      // Error toast will be handled by the syncError state
      const toast = useToast();
      toast.add({
        title: 'Sync failed',
        description: result.error || 'Failed to sync with Stripe',
        color: 'red',
        timeout: 5000
      });
    }
  } catch (error) {
    console.error('Sync error:', error);
    const toast = useToast();
    toast.add({
      title: 'Sync error',
      description: 'An unexpected error occurred during sync',
      color: 'red',
      timeout: 5000
    });
  }
};

onMounted(async () => {
  try {
    await Promise.all([
      fetchProducts(), 
      fetchCurrentSubscription(),
      getSyncStatus()
    ]);

    if (route.query.success === 'true') {
      await refreshUser();
      // Auto-sync after successful checkout
      setTimeout(() => {
        handleSync();
      }, 1000);
    }
  } catch (error) {
    console.error(error);
    throw createError('Failed to load billing information');
  }
});
</script>
