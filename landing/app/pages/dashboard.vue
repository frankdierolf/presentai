<template>
  <main class="fixed inset-0 flex overflow-hidden">
    <AppSidebar />
    <div class="w-full min-w-0 flex-1 overflow-y-auto">
      <NuxtPage />
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
});
</script>
