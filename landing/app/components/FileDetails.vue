<template>
  <div v-if="file" class="p-4">
    <div class="flex items-center justify-between mb-6">
      <h3 class="font-semibold">File Details</h3>
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="xs"
        @click="$emit('close')"
      />
    </div>

    <div class="space-y-6">
      <!-- Preview -->
      <div class="flex items-center justify-center min-h-48 bg-neutral-50 dark:bg-neutral-800 rounded-lg overflow-hidden">
        <img
          v-if="file.type.startsWith('image/')"
          :src="getFileUrl(file) || ''"
          class="h-full w-full object-cover"
          :alt="file.file"
        />
        <video
          v-else-if="file.type.startsWith('video/')"
          :src="getFileUrl(file) || ''"
          class="w-full h-full"
          controls
          playsinline
        />
        <div
          v-else-if="file.type.startsWith('audio/')"
          class="w-full p-4"
        >
          <audio
            :src="getFileUrl(file) || ''"
            class="w-full"
            controls
          />
        </div>
        <div v-else class="flex items-center justify-center h-full w-full">
          <UIcon
            :name="getFileIcon(file.type)"
            class="w-16 h-16 text-neutral-400"
          />
        </div>
      </div>

      <!-- Info -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <p class="text-sm text-neutral-500 dark:text-neutral-400">Type</p>
          <p class="text-sm font-medium">{{ file.type }}</p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-sm text-neutral-500 dark:text-neutral-400">Size</p>
          <p class="text-sm font-medium">
            {{ formatFileSize(file.size) }}
          </p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-sm text-neutral-500 dark:text-neutral-400">Owner</p>
          <p class="text-sm font-medium">
            {{ user?.email || 'Unknown' }}
          </p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-sm text-neutral-500 dark:text-neutral-400">Modified</p>
          <p class="text-sm font-medium">
            {{ useDateFormat(file.updated || file.created, 'MMM D, YYYY h:mm').value }}
          </p>
        </div>
        <div class="flex justify-between items-center">
          <p class="text-sm text-neutral-500 dark:text-neutral-400">Created</p>
          <p class="text-sm font-medium">
            {{ useDateFormat(file.created, 'MMM D, YYYY h:mm').value }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <UButton
          icon="i-lucide-download"
          color="neutral"
          variant="solid"
          block
          :to="getFileUrl(file) || ''"
          target="_blank"
        >
          Download
        </UButton>
        <UButton
          v-if="file.user === user?.id"
          icon="i-lucide-trash"
          color="error"
          block
          :loading="deletingFileId === file.id"
          @click="handleDeleteFile(file.id)"
        >
          Delete
        </UButton>
      </div>
    </div>
  </div>
  <div v-else class="h-full flex items-center justify-center p-4">
    <div class="text-center">
      <UIcon
        name="i-lucide-file"
        class="w-8 h-8 text-neutral-400 mx-auto mb-2"
      />
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        Select a file to view details
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDateFormat } from '@vueuse/core';
import { getFileIcon } from '@/utils/fileicons';
import { useFileManager } from '@/composables/useFileManager';

interface File {
  id: string;
  file: string;
  type: string;
  size: number;
  created: string;
  updated?: string;
  user: string;
}

const { file } = defineProps<{
  file: File | null;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const { user } = usePocketbase();
const { deletingFileId, deleteFile, getFileUrl } = useFileManager();

const handleDeleteFile = async (id: string) => {
  await deleteFile(id);
  emit('close');
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script> 
