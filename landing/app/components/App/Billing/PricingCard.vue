<template>
  <div
    class="flex h-full flex-col rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900"
    :class="{
      'border-neutral-300 bg-neutral-50 ring-4 ring-neutral-500/20': active ,
    }"
  >
    <p class="font-semibold">{{ title }}</p>
    <p class="mt-1 text-sm text-neutral-500">{{ description }}</p>
    <div class="mt-auto mb-2 flex items-baseline pt-4">
      <span class="text-3xl font-bold">
        {{ formatPrice(unitAmount) }}
      </span>
      <span class="ml-1 text-neutral-500">/{{ interval }} </span>
    </div>
    <UButton
      color="neutral"
      block
      :variant="active ? 'solid' : 'outline'"
      :label="active ? 'Manage plan' : 'Subscribe'"
      :loading="loading"
      @click="$emit('subscribe', priceId)"
    />
    <ul class="mt-4 space-y-1">
      <li
        v-for="feature in features"
        :key="feature.name"
        class="flex items-center gap-3 text-[var(--ui-text-muted)]"
      >
        <UIcon name="i-lucide-circle-check" class="h-4 w-4 text-neutral-400" />
        <span class="text-sm">{{ feature.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
interface Feature {
  name: string
}

interface PricingCardProps {
  title: string
  description?: string
  unitAmount?: number
  interval?: string
  loading?: boolean
  priceId: string
  features?: Feature[]
  active?: boolean
}

defineProps<PricingCardProps>()

defineEmits<{
  subscribe: [id: string]
}>()

// Move this to a shared utility
const formatPrice = (price?: number): string => {
  if (!price) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price / 100)
}
</script>
