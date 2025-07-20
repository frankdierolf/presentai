<template>
  <main>
    <div
      v-if="isLoading"
      class="h-screen w-full flex items-center justify-center gap-2 flex-col"
    >
      <UIcon name="i-lucide-loader" class="animate-spin" />
      <p>Loading Chat...</p>
    </div>

    <div v-else class="flex flex-col min-w-0 h-dvh">
      <AppChatHeader :title="currentChat?.title || ''">
        <template #actions>
          <UButton
            icon="i-lucide-upload"
            label="Share"
            color="neutral"
            @click="isShareModalOpen = true"
          />
        </template>
      </AppChatHeader>

      <AppChatMessageList :messages="messages" />

      <div class="flex mx-auto px-4 pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <form
          class="relative w-full flex flex-col gap-4"
          @submit.prevent="handleSendMessage"
        >
          <UTextarea
            v-model="messageText"
            placeholder="Type something..."
            color="neutral"
            variant="subtle"
            class="w-full"
            :rows="2"
            :max-rows="12"
            size="xl"
            :autoresize="true"
            :ui="{
              base: 'rounded-xl resize-none pb-12 md:text-sm',
            }"
            @keydown.enter.prevent="handleKeyDown"
          />
          <!-- // for future implementation - image attachments -->
          <UButton
            type="button"
            color="neutral"
            variant="subtle"
            icon="i-lucide-image-plus"
            class="absolute bottom-2 left-2 rounded-full"
          />
          <UButton
            type="submit"
            color="neutral"
            variant="solid"
            icon="i-lucide-arrow-up"
            class="absolute bottom-2 right-2 rounded-full"
            :disabled="!messageText"
            :ui="{ base: 'disabled:opacity-20' }"
          />
        </form>
      </div>
    </div>
    <UModal
      v-model:open="isShareModalOpen"
      title="Share public link to this chat"
      description="Share a read-only public link to this chat. Any messages you add
            after sharing stay private"
    >
      <template #body>
        <div v-if="!publicChatLink">
          <p class="text-sm text-neutral-500">Preview</p>
          <div class="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-lg">
            <p>
              {{ currentChat?.title }}
            </p>
            <div
              v-if="includeAuthorDetails"
              class="flex items-center gap-2 text-sm text-neutral-500 mt-2"
            >
              <span>By</span>
              <UAvatar :src="user?.avatarUrl" size="2xs" />
              <p>
                {{ user?.name }}
              </p>
            </div>
            <div class="max-h-64 overflow-y-auto">
              <AppChatMessageList :messages="messages" :preview="true" />
            </div>
          </div>
          <div class="flex items-center gap-2 mt-4 justify-between">
            <UCheckbox
              v-model="includeAuthorDetails"
              color="neutral"
              label="Include author details"
            />
            <UButton
              color="neutral"
              variant="solid"
              :loading="loadingPublicChatLink"
              label="Generate link"
              @click="handleShareChat"
            />
          </div>
        </div>
        <div
          v-else
          class="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-950 p-1 rounded-lg ps-3"
        >
          <p class="flex-1 font-mono w-full truncate">
            {{ publicChatLink }}
          </p>
          <UButtonGroup>
            <UButton
              icon="i-lucide-square-arrow-out-up-right"
              color="neutral"
              variant="subtle"
              :to="publicChatLink"
              target="_blank"
            />
            <UButton
              :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
              color="neutral"
              variant="subtle"
              @click="copy(publicChatLink)"
            />
          </UButtonGroup>
        </div>
      </template>
    </UModal>
  </main>
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
const { copy, copied } = useClipboard();
const { user } = usePocketbase();
const messageText = ref('');
const isShareModalOpen = ref(false);
const includeAuthorDetails = ref(true);
const { id } = useRoute().params;
const {
  currentChat,
  messages,
  isLoading,
  fetchChat,
  sendMessage,
  createPublicChat,
  loadingPublicChatLink,
} = useChat();

// Fetch initial data
await fetchChat(id as string);

const handleSendMessage = async () => {
  if (!messageText.value.trim()) return;

  const message = messageText.value;
  messageText.value = '';
  await sendMessage(id as string, message);
};

const handleKeyDown = (e: KeyboardEvent) => {
  // Allow new lines with Shift+Enter
  if (e.shiftKey) {
    return;
  }

  // Submit on Enter
  handleSendMessage();
};
const publicChatLink = ref('');
const handleShareChat = async () => {
  const publicChat = await createPublicChat(
    currentChat.value?.title || 'Untitled Chat',
    messages.value,
    includeAuthorDetails.value
  );
  publicChatLink.value = `${window.location.origin}/chat/${publicChat.id}`;
};
</script>
