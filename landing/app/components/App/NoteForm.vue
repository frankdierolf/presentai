<template>
  <UForm :schema="schema" :state="state" class="space-y-2" @submit="onSubmit">
    <UFormField label="Title" name="title">
      <UInput
        v-model="state.title"
        variant="soft"
        size="xl"
        placeholder="Write your note here..."
        class="w-full"
      />
    </UFormField>
    <UFormField label="Image" name="image">
      <AppSettingsImageUploader
        v-model="state.image"
        :initial-image="initialImageUrl"
        @file-selected="handleFileSelected"
      />
    </UFormField>
    <UFormField label="Content" name="content">
      <UTextarea
        v-model="state.content"
        variant="soft"
        size="xl"
        placeholder="Write your note here..."
        class="w-full"
      />
    </UFormField>

    <div class="flex justify-end gap-2">
      <UButton
        color="neutral"
        variant="soft"
        label="Cancel"
        @click="emit('cancel')"
      />
      <UButton
        type="submit"
        color="primary"
        :label="props.initialData ? 'Update Note' : 'Create Note'"
        :loading="loading"
      />
    </div>
  </UForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { z } from 'zod';
import type { NotesResponse } from '@@/pocketbase-types';
const { user } = usePocketbase();
const emit = defineEmits<{
  cancel: [];
  submit: [FormData, string?];
}>();

const props = defineProps<{
  loading?: boolean;
  initialData?: NotesResponse;
}>();

const { getImageUrl } = useNotes();
const selectedFile = ref<File | null>(null);

const initialImageUrl = computed(() => {
  if (!props.initialData?.image) return undefined;
  return getImageUrl(props.initialData);
});

const schema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(256, 'Content is too long'),
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  image: z.string().optional(),
});

type FormSchema = typeof schema;

const state = reactive<z.infer<FormSchema>>({
  content: props.initialData?.content || '',
  title: props.initialData?.title || '',
  image: initialImageUrl.value || '',
});

const handleFileSelected = (file: File | null) => {
  selectedFile.value = file;
  if (!file) {
    state.image = '';
  }
};

const onSubmit = async (event: FormSubmitEvent<z.infer<FormSchema>>) => {
  const formData = new FormData();
  formData.append('content', event.data.content);
  formData.append('title', event.data.title);
  formData.append('user', user.value?.id || '');

  if (selectedFile.value) {
    formData.append('image', selectedFile.value);
  }

  emit('submit', formData, props.initialData?.id);
};
</script>
