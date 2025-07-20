<template>
  <main>
    <div
      v-if="status === 'pending'"
      class="h-screen flex items-center justify-center flex-col gap-2"
    >
      <UIcon name="i-lucide-loader" class="animate-spin" />
      <p>Loading Chat...</p>
    </div>
    <div
      v-else-if="status === 'error'"
      class="h-screen flex items-center justify-center flex-col gap-2"
    >
      <p>Error loading chat</p>
    </div>
    <div v-else class="flex flex-col min-w-0 h-dvh">
      <UContainer class="max-w-5xl mx-auto">
        <header
          class="border-b border-neutral-200 dark:border-white/10 py-12 md:py-24"
        >
          <h1 class="text-3xl md:text-4xl font-bold text-center text-balance">
            {{ chat?.title }}
          </h1>
          <div class="flex items-center justify-center mt-5 gap-2">
            <UAvatar
              v-if="chat?.author?.avatarUrl"
              :src="chat?.author?.avatarUrl || ''"
              size="sm"
              :alt="chat?.author?.name || ''"
            />
            <p v-if="chat?.author?.name">
              {{ chat?.author?.name }}
            </p>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              {{ useDateFormat(chat?.created, 'hh:mm A MMM D, YYYY') }}
            </p>
          </div>
        </header>
        <div class="py-12">
          <AppChatMessageList
            :messages="chat?.messages || []"
            :preview="true"
          />
        </div>
      </UContainer>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { useDateFormat } from '@vueuse/core';
import type { PublicChatResponse } from '@@/pocketbase-types';
const { id } = useRoute().params;

const { pb } = usePocketbase();

const { data: chat, status } = await useAsyncData(
  'chat',
  () => pb.collection('publicChat').getOne<PublicChatResponse>(id as string),
  {
    server: false,
  }
);
</script>

<style></style>
