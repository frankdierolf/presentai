<template>
  <UDropdownMenu
    :items="items"
    :ui="{
      content: 'w-[240px]',
    }"
    :content="{
      align: 'start',
    }"
  >
    <UButton
      block
      color="neutral"
      variant="ghost"
      class="w-full hover:bg-neutral-200/80 dark:hover:bg-white/10 justify-normal text-left"
    >
      <UAvatar
        :src="user?.avatarUrl || ''"
        :alt="user?.name"
        size="xs"
        class="ring-2 ring-gray-200 dark:ring-white/10"
      />
      <div class="flex-1 flex items-center gap-2">
        <p class="text-sm">{{ user?.name }}</p>
        <UBadge
          :label="user?.pro_account ? 'Pro' : 'Free'"
          color="neutral"
          variant="subtle"
          size="sm"
        />
      </div>
      <UIcon name="i-lucide-chevron-up" />
    </UButton>
    <template #profile>
      <div class="flex items-center gap-2">
        <UAvatar
          :src="user?.avatarUrl || ''"
          :alt="user?.name"
          class="ring-2 ring-gray-200 dark:ring-white/10"
        />
        <div class="flex-1">
          <p :style="{ fontWeight: 500 }" class="text-sm">{{ user?.name }}</p>
          <p
            class="text-xs text-neutral-500 dark:text-neutral-400"
            :style="{ fontWeight: 400 }"
          >
            {{ user?.email }}
          </p>
        </div>
      </div>
    </template>
  </UDropdownMenu>
  <UModal
    v-model:open="feedbackModal"
    title="Support"
    description="Need help? We're here to assist you."
  >
    <template #body>
      <AppFeedbackForm @close="feedbackModal = false" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { user, signOut } = usePocketbase();
const mobileMenu = useState('mobileMenu');
const feedbackModal = ref(false);
const items = ref([
  [
    {
      slot: 'profile',
      label: user?.value?.name,
      avatar: {
        src: user?.value?.avatarUrl || '',
        alt: user?.value?.name,
      },
      type: 'label',
      onSelect: () => {
        mobileMenu.value = false;
      },
    },
  ],
  [
    {
      label: 'Account Settings',
      icon: 'i-lucide-user-cog',
      to: '/dashboard/settings',
      onSelect: () => {
        mobileMenu.value = false;
      },
    },
    {
      label: 'Billing',
      icon: 'i-lucide-credit-card',
      to: '/dashboard/billing',
      onSelect: () => {
        mobileMenu.value = false;
      },
    },
  ],
  [
    {
      label: 'Theme',
      icon: 'i-lucide-moon',
      children: [
        [
          {
            label: 'Light',
            icon: 'i-lucide-sun',
            onSelect: () => {
              setColorMode('light');
              mobileMenu.value = false;
            },
          },
          {
            label: 'Dark',
            icon: 'i-lucide-moon',
            onSelect: () => {
              setColorMode('dark');
              mobileMenu.value = false;
            },
          },
        ],
        [
          {
            label: 'System',
            icon: 'i-lucide-monitor',
            onSelect: () => {
              setColorMode('system');
              mobileMenu.value = false;
            },
          },
        ],
      ],
    },
  ],
  [
    {
      label: 'Support',
      icon: 'i-lucide-life-buoy',
      onSelect: () => {
        feedbackModal.value = true;
        mobileMenu.value = false;
      },
    },
    {
      label: 'Docs',
      icon: 'i-lucide-cloud',
      to: 'https://supersaas.dev/docs/pocketvue/pocketvue-introduction',
      target: '_blank',
      external: true,
    },
  ],
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      onSelect: () => {
        signOut();
        mobileMenu.value = false;
      },
      color: 'error' as const,
    },
  ],
]);

const colorMode = useColorMode();

function setColorMode(mode: string) {
  colorMode.preference = mode;
}
</script>
