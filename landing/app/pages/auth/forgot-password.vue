<template>
  <UContainer class="flex min-h-screen items-center justify-center">
    <div class="mx-auto w-full max-w-sm space-y-4">
      <img src="/logo.png" alt="logo" class="mx-auto h-10 w-auto" />
      <div class="text-center">
        <p class="text-2xl font-bold font-display">Forgot your password?</p>
        <p class="text-sm text-neutral-500">
          Please fill in your email to reset your password.
        </p>
      </div>
      <UForm
        :schema="forgotPasswordSchema"
        :state="state"
        class="mt-8 space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Email" name="email">
          <UInput
            v-model="state.email"
            class="w-full"
            size="lg"
            autocomplete="email"
          />
        </UFormField>

        <UButton
          type="submit"
          :loading="loading"
          block
          color="neutral"
          size="lg"
          class="cursor-pointer"
        >
          Reset Password
        </UButton>
      </UForm>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types';
import { useAuth } from '@/composables/useAuth';

const { forgotPassword, loading, forgotPasswordSchema } = useAuth();

type Schema = z.output<typeof forgotPasswordSchema>;

const state = reactive<Partial<Schema>>({
  email: undefined,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await forgotPassword(event.data);
    // Optionally redirect to login page after successful submission
    await navigateTo('/auth/login');
  } catch (error) {
    console.error(error);
  }
}
</script>
