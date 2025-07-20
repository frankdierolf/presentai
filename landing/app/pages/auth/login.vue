<template>
  <UContainer class="flex min-h-screen items-center justify-center">
    <div class="mx-auto w-full max-w-sm space-y-4">
      <img src="/logo.png" alt="logo" class="mx-auto h-10 w-auto" />
      <div class="text-center">
        <p class="text-2xl font-bold font-display">Sign in to Presento</p>
        <p class="text-sm text-neutral-500">
          Dont have an account?
          <UButton
            padding="none"
            trailing-icon="i-lucide-arrow-right"
            color="neutral"
            to="/auth/register"
            variant="link"
            label="Get Started"
            class="font-medium"
            :ui="{
              trailingIcon: 'size-4',
            }"
            square
          />
        </p>
      </div>
      <UForm
        :schema="loginUserSchema"
        :state="state"
        class="mt-8 space-y-4"
        @submit="onSubmit as any"
      >
        <UFormField label="Email" name="email">
          <UInput
            v-model="state.email"
            class="w-full"
            size="lg"
            autocomplete="email"
          />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput
            v-model="state.password"
            type="password"
            class="w-full"
            size="lg"
          />
          <template #hint>
            <UButton
              variant="link"
              to="/auth/forgot-password"
              label="Forgot password?"
              size="xs"
              color="neutral"
              class="text-neutral-500"
            />
          </template>
        </UFormField>

        <UButton
          type="submit"
          :loading="loading"
          block
          color="neutral"
          class="cursor-pointer"
          size="lg"
        >
          Sign in
        </UButton>
      </UForm>
      <USeparator label="Or continue with" />
      <AppSocialAuth />
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import type { z } from 'zod';

const { login, loading, loginUserSchema } = useAuth();

type Schema = z.output<typeof loginUserSchema>;

const state = reactive<Partial<Schema>>({
  email: undefined,
  password: undefined,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await login(event.data);
  } catch (error) {
    console.error(error);
  }
}
</script>
