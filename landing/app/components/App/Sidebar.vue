<template>
  <div
    class="relative hidden w-0 flex-col items-stretch border-r border-neutral-200 bg-neutral-100 md:flex md:w-64 dark:border-neutral-900 dark:bg-black"
  >
    <div class="flex-1 overflow-y-auto p-2">
      <ul class="space-y-1">
        <li v-for="link in links" :key="link.to">
          <AppSidebarLink v-bind="link" />
        </li>
      </ul>
    </div>
    <footer class="p-2">
      <AppUserDropdown />
    </footer>
  </div>
  <USlideover v-model:open="mobileMenu" side="left">
    <template #content>
      <div class="flex h-full flex-col p-2">
        <div class="flex items-center justify-between">
          <img src="/logo.png" alt="logo" class="w-6 h-6" />
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            @click="mobileMenu = false"
          />
        </div>
        <div class="mt-2 flex-1 overflow-y-auto">
          <ul class="space-y-1">
            <li v-for="link in links" :key="link.to">
              <AppSidebarLink v-bind="link" />
            </li>
          </ul>
        </div>
        <footer>
          <AppUserDropdown />
        </footer>
      </div>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
const mobileMenu = useState('mobileMenu', () => false);
const links = [
  {
    label: 'Home',
    icon: 'i-lucide-home',
    to: `/dashboard`,
  },
  {
    label: 'Notes',
    icon: 'i-lucide-file-text',
    to: `/dashboard/notes`,
  },
  {
    label: 'Tasks',
    icon: 'i-lucide-check-circle',
    to: `/dashboard/tasks`,
  },
  {
    label: 'Files',
    icon: 'i-lucide-file',
    to: `/dashboard/files`,
  },
  {
    label: 'AI Chat',
    icon: 'i-lucide-message-square',
    to: `/dashboard/ai-chat`,
  },
];
</script>
