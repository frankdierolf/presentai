<template>
  <div>
    <div
      v-if="loading"
      class="h-screen w-full flex items-center justify-center gap-2 flex-col"
    >
      <UIcon name="i-lucide-loader" class="animate-spin" />
      <p>{{ loadingText }}</p>
    </div>
    <div class="p-4">
      <header class="flex gap-2 items-center">
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          class="flex md:hidden"
          @click="mobileMenu = !mobileMenu"
        />
        <div class="min-w-0 flex-1">
          <h1 class="flex-1 truncate font-bold">{{ title }}</h1>
          <p class="truncate text-xs text-neutral-500 md:text-sm">
            {{ description }}
          </p>
        </div>
        <slot name="actions" />
      </header>
      <div class="mt-4">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const mobileMenu = useState('mobileMenu');
defineProps<{
  title: string;
  description?: string;
  loading?: boolean;
  loadingText?: string;
}>();
</script>
