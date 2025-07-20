<template>
  <AppDemoCard :title="title" :description="description">
    <div class="flex items-end gap-3">
      <p class="text-2xl sm:text-4xl font-bold">{{ value }}</p>
      <span v-if="down" class="text-rose-500 flex items-center gap-1">
        <UIcon name="i-lucide-arrow-down" />
        <span>{{ down }}</span>
      </span>
      <span v-if="up" class="text-emerald-500 flex items-center gap-1">
        <UIcon name="i-lucide-arrow-up" />
        <span>{{ up }}</span>
      </span>
    </div>
  </AppDemoCard>
</template>

<script lang="ts" setup>
defineProps<{
  title: string;
  value: string;
  down?: string;
  up?: string;
  description?: string;
}>();
</script>
