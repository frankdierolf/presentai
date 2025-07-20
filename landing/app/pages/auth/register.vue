<template>
  <UContainer class="flex min-h-screen items-center justify-center">
    <div class="mx-auto w-full max-w-sm space-y-4">
      <img src="/logo.png" alt="logo" class="mx-auto h-10 w-auto" />
      <div class="text-center">
        <p class="text-2xl font-bold font-display">Get Started with Presento</p>
        <p class="text-sm text-neutral-500">
          Already have an account?
          <UButton
            padding="none"
            trailing-icon="i-lucide-arrow-right"
            color="neutral"
            to="/auth/login"
            variant="link"
            label="Login"
            class="font-normal"
            :ui="{
              trailingIcon: 'size-4',
            }"
            square
          />
        </p>
      </div>
      <UForm
        :schema="registerUserSchema"
        :state="state"
        class="mt-8 space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Name" name="name">
          <UInput
            v-model="state.name"
            class="w-full"
            size="lg"
            autocomplete="given-name"
          />
        </UFormField>
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
            autocomplete="new-password"
          />
        </UFormField>

        <UFormField label="Confirm Password" name="passwordConfirm">
          <UInput
            v-model="state.passwordConfirm"
            type="password"
            class="w-full"
            size="lg"
            autocomplete="new-password"
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
          Submit
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

const { register, loading, registerUserSchema } = useAuth();

type Schema = z.output<typeof registerUserSchema>;

const state = reactive<Partial<Schema>>({
  name: undefined,
  email: undefined,
  password: undefined,
  passwordConfirm: undefined,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await register(event.data);
  } catch (error) {
    console.error(error);
  }
}
</script>
