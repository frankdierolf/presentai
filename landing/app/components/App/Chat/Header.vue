<template>
  <header class="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
    <div class="flex gap-2 items-center w-full">
      <UButton
        icon="i-lucide-menu"
        color="neutral"
        variant="ghost"
        class="flex md:hidden"
        @click="mobileMenu = !mobileMenu"
      />
      <div class="min-w-0 flex-1">
        <h1 class="flex-1 truncate font-medium">{{ title }}</h1>
      </div>
      <slot name="actions"></slot>
    </div>
  </header>
</template>

<script setup lang="ts">
const mobileMenu = useState('mobileMenu');
defineProps<{
  title: string;
  description?: string;
  loading?: boolean;
  loadingText?: string;
}>();
</script>
