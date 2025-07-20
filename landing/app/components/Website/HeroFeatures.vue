<template>
  <UContainer class="max-w-7xl mx-auto pb-12">
    <div
      class="mt-8 rounded-2xl sm:rounded-3xl overflow-hidden p-2 bg-neutral-100 dark:bg-white/10 ring-1 ring-neutral-200 dark:ring-white/20"
    >
      <UTabs
        v-model="active"
        :items="items"
        color="neutral"
        :content="false"
        class="w-full -mx-1 sm:-mx-0.5 mb-0.5 sm:mb-2"
        size="md"
        :ui="{ list: 'rounded-xl', indicator: 'rounded-xl', label: 'hidden sm:block', trigger: 'py-2.5' }"
      />
      <video
        ref="videoRef"
        :autoplay="true"
        :loop="true"
        :muted="true"
        :playsinline="true"
        class="h-full w-full rounded-xl sm:rounded-2xl overflow-hidden object-cover metal-shadow"
      >
        <source :src="items[parseInt(active)]?.videoUrl" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 text-center mt-2 block sm:hidden">
        {{ items[parseInt(active)]?.label }}
      </p>
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
const items = ref([
  {
    label: 'Authentication',
    icon: 'i-lucide-user',
    videoUrl: 'https://essentials.supersaas.dev/auth.mp4',
  },
  {
    label: 'Database',
    icon: 'i-lucide-database',
    videoUrl: 'https://essentials.supersaas.dev/Notes.mp4',
  },
  {
    label: 'Payments',
    icon: 'i-lucide-credit-card',
    videoUrl: 'https://essentials.supersaas.dev/tasks.mp4',
  },
  {
    label: 'Emails',
    icon: 'i-lucide-mail',
    videoUrl: 'https://essentials.supersaas.dev/essentials_file-storage.mp4',
  },
  {
    label: 'Rich Demos',
    icon: 'i-lucide-layout-grid',
    videoUrl: 'https://essentials.supersaas.dev/essentials_admin.mp4',
  },
]);

const active = ref('0');

const videoRef = ref<HTMLVideoElement | null>(null);

watch(active, () => {
  if (videoRef.value) {
    videoRef.value.load();
  }
});
</script>

<style></style>
