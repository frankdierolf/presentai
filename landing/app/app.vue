<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator color="#000000" />
  <UApp :toaster="{ position: 'top-center' }">
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">
const { pb, updateUser } = usePocketbase();

onMounted(() => {
  const removeListener = pb.authStore.onChange((_, record) => {
    updateUser(record);
  });

  onUnmounted(() => {
    removeListener?.();
  });
});
</script>
