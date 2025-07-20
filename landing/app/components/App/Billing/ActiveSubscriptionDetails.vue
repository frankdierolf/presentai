<template>
  <div
    class="flex h-full flex-col rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="space-y-2">
        <h3 class="text-lg font-medium">
          You are on <span class="font-bold text-green-600 dark:text-green-400">Pro</span>
        </h3>
        <p class="text-sm text-neutral-500">
          Access all premium features and manage your subscription
        </p>
      </div>
      <UButton
        icon="i-lucide-credit-card"
        color="neutral"
        variant="ghost"
        label="Manage billing"
        :loading="isLoadingBillingPortal"
        @click="handleManageBilling()"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const { handleManageBilling, isLoadingBillingPortal } = useBilling();
</script>
