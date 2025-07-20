<template>
  <div
    class="p-2 bg-neutral-100 dark:bg-neutral-950 rounded-xl break-inside-avoid-column"
    @dblclick="handleDelete"
  >
    <img
      v-if="imageUrl"
      :src="imageUrl"
      class="w-full object-cover rounded-lg block min-h-40 bg-neutral-200 overflow-hidden shadow-md"
      alt="Note image"
    />
    <div class="space-y-2 py-2 px-1">
      <p class="font-medium text-neutral-700 dark:text-neutral-300">
        {{ note.title }}
      </p>
      <p class="text-sm text-neutral-500 dark:text-neutral-300">{{ note.content }}</p>
      <p class="text-xs text-neutral-500 dark:text-neutral-300">
        {{ useDateFormat(note.created, 'MMM D, YYYY') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NotesResponse } from '@@/pocketbase-types';
import { useDateFormat } from '@vueuse/core';
const props = defineProps<{
  note: NotesResponse;
  imageUrl: string | null;
  canDelete: boolean;
  isDeleting: boolean;
}>();

const emit = defineEmits<{
  delete: [NotesResponse];
}>();

const handleDelete = () => {
  if (!confirm('Are you sure you want to delete this note?')) return;
  emit('delete', props.note);
};
</script>
