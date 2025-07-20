<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Type" name="type">
      <USelect
        v-model="state.type"
        value-key="id"
        :items="types"
        class="w-full"
        color="neutral"
        variant="soft"
      >
        <template #leading="{ modelValue, ui }">
          <UChip
            v-if="modelValue"
            v-bind="getChip(modelValue as string)"
            inset
            standalone
            :size="ui.itemLeadingChipSize()"
            :class="ui.itemLeadingChip()"
          />
        </template>
      </USelect>
    </UFormField>
    <UFormField label="Message" name="message">
      <UTextarea
        v-model="state.message"
        type="text"
        class="w-full"
        color="neutral"
        variant="soft"
      />
    </UFormField>

    <UButton type="submit" :loading="loading"> Submit </UButton>
  </UForm>
</template>

<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '#ui/types';
const { pb, user } = usePocketbase();
const loading = ref(false);
const types = ref([
  {
    label: 'Idea',
    id: 'idea',
    chip: {
      color: 'info' as const,
    },
  },
  {
    label: 'Issue',
    id: 'issue',
    chip: {
      color: 'error' as const,
    },
  },
  {
    label: 'Feature Request',
    id: 'feature_request',
    chip: {
      color: 'warning' as const,
    },
  },
  {
    label: 'Other',
    id: 'other',
    chip: {
      color: 'neutral' as const,
    },
  },
]);

function getChip(value: string) {
  return types.value.find((item) => item.id === value)?.chip;
}
const schema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(1000, 'Message is too long'),
  type: z.enum(['idea', 'issue', 'feature_request', 'other']),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  type: 'idea',
  message: undefined,
});
const emit = defineEmits(['close']);
const toast = useToast();
async function onSubmit(event: FormSubmitEvent<Schema>) {
  const loading = ref(false);
  try {
    loading.value = true;
    await pb.collection('feedback').create({
      ...event.data,
      user: user.value?.id,
    });
    toast.add({
      title: 'Feedback submitted',
      description: 'We will get back to you as soon as possible.',
      color: 'success',
    });
    state.message = undefined;
    state.type = 'idea';
    emit('close');
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}
</script>
