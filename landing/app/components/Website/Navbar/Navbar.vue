<template>
  <header class="sticky w-full top-0 z-50 py-2 sm:py-4 px-2 sm:px-0">
    <UContainer
      class="mx-auto h-12 sm:h-16 flex items-center justify-between gap-4 px-4 text-sm relative transition-all duration-500"
      :class="contentClass"
    >
      <div class="flex items-center gap-2">
        <img alt="Presento Logo" class="h-8 w-auto" src="/logo.png" />
        <span class="font-bold text-lg font-display">Presento</span>
      </div>

      <NuxtLink
        class="h-8 flex items-center justify-center relative mr-2 group"
        :to="user ? '/dashboard' : '/auth/login'"
      >
        <div class="flex gap-4 items-center relative z-20">
          <span> {{ user ? 'Go to app' : 'Sign In' }} </span>
          <Icon name="lucide:arrow-right" class="h-4 w-4" />
        </div>
        <span
          class="h-8 pointer-events-none z-10 w-8 group-hover:w-[130%] transition-all absolute top-0 -right-2 bg-neutral-200 dark:bg-white/10 rounded-full flex items-center justify-center"
        >
        </span>
      </NuxtLink>
    </UContainer>
  </header>
</template>

<script setup>
const { user } = usePocketbase();
const y = ref(0);

let scrollHandler = null;

const updateScroll = () => {
  y.value = window.scrollY;
};

const initScrollHandler = () => {
  if (typeof window !== 'undefined') {
    scrollHandler = () => updateScroll();
    window.addEventListener('scroll', scrollHandler);
    updateScroll();
  }
};

const contentClass = computed(() => {
  return y.value > 10
    ? 'max-w-3xl bg-white/90 dark:bg-neutral-900/60 rounded-full shadow-xl backdrop-blur py-4 translate-y-2 ring-1 ring-neutral-100 dark:ring-white/10'
    : 'max-w-6xl';
});

onMounted(() => {
  initScrollHandler();
});

onUnmounted(() => {
  if (typeof window !== 'undefined' && scrollHandler) {
    window.removeEventListener('scroll', scrollHandler);
  }
});
</script>
