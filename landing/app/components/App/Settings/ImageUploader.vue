<template>
  <div class="flex flex-col gap-2 relative">
    <div class="absolute -top-2 -right-2 z-30">
      <UButton
        v-if="model || initialImage"
        icon="i-lucide-x"
        color="error"
        variant="solid"
        size="xs"
        @click="removeImage"
      />
    </div>
    <button
      type="button"
      class="h-40 w-full relative z-20 bg-neutral-50 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg dark:bg-neutral-800 flex items-center justify-center flex-col gap-2 overflow-hidden cursor-pointer"
      @click="open()"
    >
      <UIcon
        v-if="!model && !initialImage"
        name="i-lucide-image-plus"
        class="w-5 h-4 text-neutral-400"
      />
      <img v-else :src="model || initialImage" class="w-full h-full object-cover" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useFileDialog, useObjectUrl } from '@vueuse/core';

const model = defineModel<string | undefined>();

const props = defineProps<{
  initialImage?: string;
}>();

const { files, open, onChange } = useFileDialog({
  accept: 'image/*',
  multiple: false,
});

const emit = defineEmits<{
  'file-selected': [file: File | null];
}>();

onChange(() => {
  const file = files.value?.[0];
  if (file) {
    const objectUrl = useObjectUrl(file);
    model.value = objectUrl.value;
    emit('file-selected', file);
  }
});

const removeImage = () => {
  model.value = undefined;
  emit('file-selected', null);
};
</script>
