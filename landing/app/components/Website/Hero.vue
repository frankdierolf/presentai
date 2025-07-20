<template>
  <UContainer class="mx-auto max-w-4xl pt-4 sm:pt-12 relative">
    <div class="my-4 sm:my-8 space-y-4 sm:space-y-8">
      <div class="leading-none text-black dark:text-white text-center">
        <h1 class="text-3xl sm:text-7xl tracking-tight font-bold font-display">
          <span class="inline-block animate-1">The most advanced</span>
          <span class="inline-block animate-2">AI Platform</span>
        </h1>
      </div>
      <div
        class="text-base sm:text-xl text-neutral-500 leading-relaxed dark:text-neutral-400 animate-3 text-center text-balance max-w-3xl mx-auto"
      >
        Get a complete Frontend, Dashboard, Authentication, Database, Payments,
        Emails, File Storage, Blog, Landing page, Docs made with Nuxt 3 (SPA)
        and Pocketbase.
      </div>
      <div class="flex items-center gap-4 animate-4 justify-center flex-col">
        <UButton
          size="xl"
          :to="user ? '/dashboard' : '/auth/register'"
          class="rounded-2xl ring-4 ring-neutral-900/10 dark:ring-white/20 px-6 hover:ring-2 transition-shadow duration-300"
          label="Get Started for $99"
        />
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          This is a demo landing page.
        </p>
      </div>
    </div>
  </UContainer>
  <WebsiteHeroFeatures class="animate-5" />
</template>

<script setup>
const { user } = usePocketbase();
</script>

<style scoped>
.animate-1 {
  animation: fade-up 0.9s 0.5s cubic-bezier(0, 0.9, 0.3, 1) forwards;
  opacity: 0;
}
.animate-2 {
  animation: fade-up 0.9s 0.6s cubic-bezier(0, 0.9, 0.3, 1) forwards;
  opacity: 0;
}

.animate-3 {
  animation: fade-up 0.9s 0.7s cubic-bezier(0, 0.9, 0.3, 1) forwards;
  opacity: 0;
}

.animate-4 {
  animation: fade-up 0.9s 0.8s cubic-bezier(0, 0.9, 0.3, 1) forwards;
  opacity: 0;
}

.animate-5 {
  animation: fade-up 0.9s 0.9s cubic-bezier(0, 0.9, 0.3, 1) forwards;
  opacity: 0;
}

@keyframes fade-up {
  0% {
    opacity: 0;
    transform: translateY(4rem);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}
</style>
