<template>
  <ul
    v-auto-animate
    class="flex flex-col-reverse min-w-0 gap-6 flex-1 overflow-y-auto pt-4 scroll-smooth"
  >
    <li
      v-for="message in [...messages].reverse()"
      :key="message.id"
      class="w-full mx-auto max-w-3xl px-4 group/message"
      :data-role="message.role"
    >
      <AppChatMessageBubble :message="message" :preview="preview" />
    </li>
  </ul>
  <div
    v-if="isMessageLoading"
    class="flex items-center gap-4 w-full mx-auto max-w-3xl px-4"
  >
    <UIcon name="i-lucide-loader" class="animate-spin" />
    <p>AI is thinking...</p>
  </div>
  <div class="shrink-0 min-w-[24px] min-h-[24px]"></div>
</template>

<script setup lang="ts">
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

defineProps<{
  messages: Message[];
  preview?: boolean;
}>();

const isMessageLoading = useState('isMessageLoading');
</script>
