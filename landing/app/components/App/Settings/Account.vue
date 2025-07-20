<template>
  <UCard>
    <template #header>
      <h3 class="font-medium">Personal Information</h3>
      <p class="mt-1 text-sm text-neutral-500">
        Your personal information is not shared with anyone.
      </p>
    </template>
    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit as any"
    >
      <UFormField label="Avatar" name="avatar">
        <AppSettingsAvatarUploader
          v-model="state.avatarUrl"
          @file-selected="handleFileSelected"
        />
      </UFormField>
      <UFormField label="Name" name="name">
        <UInput
          v-model="state.name"
          placeholder="Name"
          class="w-full"
          size="lg"
        />
      </UFormField>
      <UFormField label="Email">
        <UInput
          :value="user?.email"
          placeholder="Email"
          class="w-full"
          disabled
          variant="subtle"
          size="lg"
        />
      </UFormField>
      <UFormField label="Account ID">
        <UInput
          :value="user?.id"
          placeholder="Account ID"
          class="w-full"
          disabled
          variant="subtle"
          size="lg"
        />
      </UFormField>
      <UButton
        color="neutral"
        :loading="loading"
        :disabled="loading"
        type="submit"
        label="Save"
      />
    </UForm>
  </UCard>
</template>

<script lang="ts" setup>
import type { UsersResponse } from '@@/pocketbase-types';
import type { FormSubmitEvent } from '#ui/types';
import { z } from 'zod';

const { pb, user } = usePocketbase();
const loading = ref(false);
const selectedFile = ref<File | null>(null);

// Form validation schema
const schema = z.object({
  avatarUrl: z.string().optional(),
  name: z.string().min(1),
});

type FormSchema = typeof schema;

const handleFileSelected = (file: File | null) => {
  selectedFile.value = file;
  if (!file) {
    state.avatarUrl = '';
  }
};

const state = reactive<z.infer<FormSchema>>({
  name: user.value?.name ?? '',
  avatarUrl: user.value?.avatarUrl ?? '',
});

const onSubmit = async (event: FormSubmitEvent<z.infer<FormSchema>>) => {
  try {
    loading.value = true;
    const formData = new FormData();
    formData.append('name', event.data.name);

    if (selectedFile.value) {
      formData.append('avatar', selectedFile.value);
    }

    // Update user record with new data
    if (user.value?.id) {
      await pb
        .collection('users')
        .update<UsersResponse>(user.value.id, formData);
    }

    // Refresh the page to update the user data
    await navigateTo('/dashboard/settings', { replace: true });
  } catch (error) {
    console.error(error);
    throw createError('Failed to update profile');
  } finally {
    loading.value = false;
  }
};
</script>
