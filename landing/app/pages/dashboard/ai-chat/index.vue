<template>
  <AppContainer
    title="AI Chat"
    :loading="isLoading"
    loading-text="Loading Chats"
  >
    <template #actions>
      <UButton label="New Chat" color="neutral" @click="newChat" />
    </template>
    <div v-if="isLoading" class="flex justify-center items-center h-40">
      <UIcon name="i-lucide-loader" class="animate-spin" />
    </div>
    <div v-else class="max-w-2xl mx-auto">
      <div
        v-if="chats.length === 0"
        class="text-center text-sm text-neutral-500 min-h-96 flex items-center flex-col gap-2 justify-center"
      >
        <UIcon
          name="i-lucide-message-square"
          class="text-neutral-300 text-6xl"
        />
        <p>No Conversations With AI Yet</p>
      </div>
      <ul class="space-y-2">
        <li v-for="chat in chats" :key="chat.id">
          <NuxtLink
            :to="`/dashboard/ai-chat/${chat.id}`"
            class="block p-4 bg-neutral-100 dark:bg-neutral-950 rounded-lg group"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <p>
                  {{ chat.title }}
                </p>
                <p class="text-xs text-neutral-500">
                  {{ useDateFormat(chat.created, 'MMM D, YYYY').value }}
                </p>
              </div>
              <UButton
                icon="i-lucide-trash"
                color="error"
                size="sm"
                variant="ghost"
                class="opacity-10 group-hover:opacity-100"
                :loading="deletingChatId === chat.id"
                @click.prevent="deleteChat(chat.id)"
              />
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </AppContainer>
</template>

<script setup lang="ts">
import { useDateFormat } from '@vueuse/core';
const { chats, isLoading, fetchChats, createChat, deleteChat, deletingChatId } =
  useChat();
const { user } = usePocketbase();
const newChat = async () => {
  const formData = new FormData();
  formData.append('title', 'Untitled AI Chat');
  formData.append('user', user.value?.id || '');
  const chat = await createChat(formData);
  if (chat) {
    await navigateTo(`/dashboard/ai-chat/${chat.id}`);
  }
};

onMounted(() => {
  fetchChats();
});
</script>
