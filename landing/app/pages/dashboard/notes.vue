<template>
  <AppContainer title="Notes">
    <template #actions>
      <UButton
        icon="i-lucide-plus"
        label="New Note"
        color="neutral"
        :loading="loading"
        @click="openCreateModal"
      />
    </template>

    <div v-if="isLoading" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader" class="animate-spin" />
    </div>
    <div v-else>
      <div
        v-auto-animate
        class="columns-1 md:columns-2 lg:columns-5 gap-3 space-y-3 w-full"
      >
        <div
          v-for="note in notes"
          :key="note.id"
          class="break-inside-avoid-column rounded-2xl bg-neutral-100 dark:bg-neutral-950"
        >
          <div class="rounded-xl bg-[#fbfaf9] p-1.5 dark:bg-neutral-950">
            <div
              class="card-shadow group rounded-md bg-white dark:bg-neutral-900"
            >
              <header
                class="flex min-w-0 items-center gap-2 border-b border-neutral-100 px-4 py-2 dark:border-white/10"
              >
                <p
                  class="flex-1 truncate text-sm text-neutral-600 dark:text-neutral-400"
                >
                  {{ note.title }}
                </p>
                <div
                  class="flex opacity-10 transition-opacity group-hover:opacity-100"
                >
                  <UButton
                    icon="i-lucide-pencil"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    @click="openEditModal(note)"
                  />
                  <UButton
                    icon="i-lucide-trash"
                    color="error"
                    variant="ghost"
                    size="xs"
                    :loading="deletingNoteId === note.id"
                    @click="confirmDelete(note.id)"
                  />
                </div>
              </header>
              <div class="px-4 py-6">
                <img
                  v-if="getImageUrl(note)"
                  :src="getImageUrl(note)"
                  class="mb-2 min-h-40 w-full rounded-md object-cover"
                  :alt="note.title"
                />
                <p
                  class="text-sm whitespace-pre-wrap text-neutral-500 dark:text-neutral-400"
                >
                  {{ note.content }}
                </p>
              </div>
              <footer
                class="flex min-w-0 items-center justify-between gap-2 border-t border-neutral-100 px-4 py-2 dark:border-white/10"
              >
                <p class="text-xs font-medium text-neutral-500">
                  {{ useDateFormat(note.created, 'MMM DD hh:mm A') }}
                </p>
              </footer>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="notes.length === 0"
        class="text-center text-sm text-neutral-500 min-h-96 flex items-center flex-col gap-2 justify-center"
      >
        <UIcon name="i-lucide-folder-open" class="text-neutral-300 text-6xl" />
        <p>You have no notes yet!</p>
      </div>
    </div>

    <!-- Note Modal (Create/Edit) -->
    <UModal
      v-model:open="noteModal.isOpen"
      :title="noteModal.isEdit ? 'Edit Note' : 'New Note'"
      :description="noteModal.isEdit ? 'Update your note' : 'Create a new note'"
    >
      <template #body>
        <AppNoteForm
          :loading="loading"
          :initial-data="noteModal.isEdit ? noteModal.editData : undefined"
          @submit="onSubmit"
          @cancel="noteModal.isOpen = false"
        />
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="deleteModal.isOpen" title="Delete Note">
      <template #body>
        <p class="mb-4">
          Are you sure you want to delete this note? This action cannot be
          undone.
        </p>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="outline"
            @click="deleteModal.isOpen = false"
          />
          <UButton
            label="Delete"
            color="error"
            :loading="loading"
            @click="handleDeleteNote"
          />
        </div>
      </template>
    </UModal>
  </AppContainer>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useDateFormat } from '@vueuse/core';
import type { NotesResponse } from '@@/pocketbase-types';

const {
  notes,
  isLoading,
  loading,
  deletingNoteId,
  fetchNotes,
  deleteNote,
  getImageUrl,
  subscribeToNotes,
  unsubscribeFromNotes,
  handleSubmit,
} = useNotes();

const noteModal = reactive({
  isOpen: false,
  isEdit: false,
  editData: null as NotesResponse | null,
});

const deleteModal = reactive({
  isOpen: false,
  noteId: null as string | null,
});

const openCreateModal = () => {
  noteModal.isEdit = false;
  noteModal.editData = null;
  noteModal.isOpen = true;
};

const openEditModal = (note: NotesResponse) => {
  noteModal.isEdit = true;
  noteModal.editData = note;
  noteModal.isOpen = true;
};

const confirmDelete = (noteId: string) => {
  deleteModal.noteId = noteId;
  deleteModal.isOpen = true;
};

const handleDeleteNote = async () => {
  if (!deleteModal.noteId) return;

  try {
    await deleteNote(deleteModal.noteId);
    deleteModal.isOpen = false;
    deleteModal.noteId = null;
  } catch (error) {
    console.error('Error deleting note:', error);
  }
};

const onSubmit = async (formData: FormData, noteId?: string) => {
  try {
    const success = await handleSubmit(formData, noteId);
    if (success) {
      noteModal.isOpen = false;
    }
  } catch (error) {
    console.error('Error submitting note:', error);
  }
};

onMounted(() => {
  fetchNotes();
  subscribeToNotes();
});

onUnmounted(() => {
  unsubscribeFromNotes();
});
</script>
