<template>
  <div
    v-if="message.role === 'user'"
    class="flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:w-fit"
    :class="{ preview: 'text-sm' }"
  >
    <div
      class="flex flex-col gap-4 bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded-xl"
    >
      <MDC
        :value="message.content"
        class="prose dark:prose-invert breakwords prose-pre:overflow-x-auto prose-pre:whitespace-pre-wrap prose-pre:border prose-pre:border-neutral-200 prose-pre:dark:border-white/10 prose-pre:bg-neutral-50 prose-pre:dark:bg-black prose-pre:p-4 prose-pre:rounded-2xl"
      />
    </div>
  </div>
  <div
    v-if="message.role === 'assistant'"
    class="flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:w-fit group"
  >
    <UAvatar
      src="https://api.dicebear.com/9.x/glass/svg?seed=Maria"
      alt="assistant"
      size="xs"
      class="ring-2 ring-neutral-500/10 dark:ring-white/10"
    />
    <div>
      <MDC
        :value="message.content"
        class="prose dark:prose-invert breakwords prose-pre:overflow-x-auto prose-pre:whitespace-pre-wrap prose-pre:border prose-pre:border-neutral-200 prose-pre:dark:border-white/10 prose-pre:bg-neutral-50 prose-pre:dark:bg-black prose-pre:p-4 prose-pre:rounded-2xl"
      />
      <div
        v-if="!preview"
        class="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <UButton
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
          variant="ghost"
          size="sm"
          @click="copy(message.content)"
        />
        <UButton
          icon="i-lucide-thumbs-up"
          variant="ghost"
          size="sm"
          :color="message.reaction === 'liked' ? 'primary' : 'neutral'"
          @click="messageFeedback(message.id, 'liked')"
        />
        <UButton
          icon="i-lucide-thumbs-down"
          variant="ghost"
          size="sm"
          :color="message.reaction === 'disliked' ? 'primary' : 'neutral'"
          @click="messageFeedback(message.id, 'disliked')"
        />
        <UButton
          icon="i-lucide-trash-2"
          variant="ghost"
          size="sm"
          @click="deleteMessage(message.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
const { copy, copied } = useClipboard();
const { messageFeedback, deleteMessage } = useChat();
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reaction: 'liked' | 'disliked' | 'none';
}

defineProps<{
  message: Message;
  preview?: boolean;
}>();
</script>
