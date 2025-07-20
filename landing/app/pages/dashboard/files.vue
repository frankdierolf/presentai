<template>
  <div class="h-screen flex flex-col">
    <!-- Sticky Header -->
    <header
      class="sticky top-0 z-10 h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between px-4"
    >
      <UButton
        icon="i-lucide-menu"
        color="neutral"
        variant="ghost"
        class="flex md:hidden"
        @click="mobileMenu = !mobileMenu"
      />
      <p class="font-semibold">File Manager</p>
      <UButton
        icon="i-lucide-upload"
        color="neutral"
        size="sm"
        label="Upload"
        :loading="loading"
        @click="openFileDialog()"
      />
    </header>

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center py-8">
          <UIcon name="i-lucide-loader" class="animate-spin" />
        </div>

        <!-- Files List -->
        <div v-else class="overflow-x-auto">
          <table
            class="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800"
          >
            <thead>
              <tr
                class="text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
              >
                <th class="px-4 py-3">File</th>
                <th class="px-4 py-3">Name</th>
                <th class="px-4 py-3">Size</th>
                <th class="px-4 py-3">Created</th>
                <th class="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
              <tr
                v-for="file in files"
                :key="file.id"
                class="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer"
                :class="{
                  'bg-neutral-100 dark:bg-neutral-800':
                    selectedFile?.id === file.id,
                }"
                @click="selectedFile = file"
              >
                <td class="px-4 py-3">
                  <img
                    v-if="file.type.startsWith('image/')"
                    :src="getFileUrl(file) || ''"
                    class="w-12 h-12 object-cover rounded"
                    :alt="file.file"
                  />
                  <div
                    v-else
                    class="h-12 w-12 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded"
                  >
                    <UIcon
                      :name="getFileIcon(file.type)"
                      class="w-8 h-8 text-neutral-400"
                    />
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-sm font-medium truncate max-w-xs">
                    {{ file.file }}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-sm text-neutral-600 dark:text-neutral-400">
                    {{ formatFileSize(file.size) }}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-sm text-neutral-600 dark:text-neutral-400">
                    {{ useDateFormat(file.created, 'MMM D, YYYY').value }}
                  </div>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex gap-2 justify-end">
                    <UButton
                      icon="i-lucide-download"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      :to="getFileUrl(file) || ''"
                      target="_blank"
                    />
                    <UButton
                      v-if="file.user === user?.id"
                      icon="i-lucide-trash"
                      color="error"
                      variant="ghost"
                      size="xs"
                      :loading="deletingFileId === file.id"
                      @click.stop="handleDeleteFile(file.id)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Fixed Sidebar -->
      <div
        class="hidden md:block w-80 flex-shrink-0 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-y-auto"
      >
        <FileDetails :file="selectedFile" @close="selectedFile = null" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFileManager } from '@/composables/useFileManager';
import { useDateFormat, useFileDialog } from '@vueuse/core';
import { getFileIcon } from '@/utils/fileicons';

const mobileMenu = useState('mobileMenu');

const { user } = usePocketbase();
const selectedFile = ref<File | null>(null);
const loading = ref(false);

// File management
const { files, isLoading, deletingFileId, createFile, deleteFile, getFileUrl } =
  useFileManager();

// File upload handling
const { open: openFileDialog, onChange: onFileSelect } = useFileDialog({
  multiple: false,
});

// File selection handler
onFileSelect((files) => {
  if (!files?.[0]) return;
  handleFileUpload(files[0]);
});

// File upload handler
async function handleFileUpload(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('size', file.size.toString());
  formData.append('type', file.type);
  formData.append('user', user.value?.id || '');

  try {
    loading.value = true;
    await createFile(formData);
  } catch (error) {
    console.error(error);
    throw createError('Failed to upload file');
  } finally {
    loading.value = false;
  }
}

// File size formatter
function formatFileSize(bytes: string) {
  const size = parseInt(bytes);
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
  return (size / (1024 * 1024)).toFixed(1) + ' MB';
}

// File deletion handler
const handleDeleteFile = async (fileId: string) => {
  try {
    await deleteFile(fileId);
    if (selectedFile.value?.id === fileId) {
      selectedFile.value = null;
    }
  } catch (error) {
    console.error(error);
    throw createError('Failed to delete file');
  }
};
</script>
