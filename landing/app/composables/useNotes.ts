import type { NotesResponse } from '@@/pocketbase-types';

export function useNotes() {
  const { pb, user } = usePocketbase();
  const { freeLimits } = useRuntimeConfig().public;
  const toast = useToast();
  const notes = ref<NotesResponse[]>([]);
  const isLoading = ref(true);
  const deletingNoteId = ref<string | null>(null);
  const loading = ref(false);

  const fetchNotes = async () => {
    try {
      isLoading.value = true;
      notes.value = await pb.collection('notes').getFullList<NotesResponse>({
        sort: '-created',
        expand: 'user',
      });
    } catch (error) {
      console.error(error);
      throw createError('Failed to fetch notes');
    } finally {
      isLoading.value = false;
    }
  };

  const createNote = async (formData: FormData) => {
    try {
      await pb.collection('notes').create(formData);
    } catch (error) {
      console.error(error);
      throw createError('Failed to create note');
    }
  };

  const updateNote = async (id: string, formData: FormData) => {
    try {
      await pb.collection('notes').update(id, formData);
    } catch (error) {
      console.error(error);
      throw createError('Failed to update note');
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      deletingNoteId.value = noteId;
      await pb.collection('notes').delete(noteId);
    } catch (error) {
      console.error(error);
      throw createError('Failed to delete note');
    } finally {
      deletingNoteId.value = null;
    }
  };

  const getImageUrl = (note: NotesResponse) => {
    return note.image ? pb.files.getURL(note, note.image) : null;
  };

  const subscribeToNotes = () => {
    pb.collection('notes').subscribe('*', async (e) => {
      if (notes.value) {
        if (e.action === 'create') {
          notes.value = [e.record as NotesResponse, ...notes.value];
        } else if (e.action === 'delete') {
          notes.value = notes.value.filter((note) => note.id !== e.record.id);
        } else if (e.action === 'update') {
          notes.value = notes.value.map((note) =>
            note.id === e.record.id ? (e.record as NotesResponse) : note
          );
        }
      }
    });
  };

  const unsubscribeFromNotes = () => {
    pb.collection('notes').unsubscribe();
  };

  const handleSubmit = async (formData: FormData, noteId?: string) => {
    try {
      loading.value = true;
      if (!user.value?.pro_account && notes.value.length >= freeLimits.notes) {
        toast.add({
          title: 'You have reached the free limit for notes',
          description: 'Please subscribe to create unlimited notes',
          color: 'error',
          actions: [
            {
              icon: 'i-lucide-arrow-right',
              label: 'Upgrade',
              color: 'neutral',
              variant: 'outline',
              to: '/dashboard/billing',
            },
          ],
        });
        return false;
      }

      if (noteId) {
        await updateNote(noteId, formData);
        toast.add({
          title: 'Note updated',
          description: 'Your note has been updated successfully',
          color: 'success',
        });
      } else {
        await createNote(formData);
        toast.add({
          title: 'Note created',
          description: 'Your note has been created successfully',
          color: 'success',
        });
      }
      return true;
    } catch (error) {
      console.error(error);
      throw createError('Failed to save note');
    } finally {
      loading.value = false;
    }
  };

  return {
    notes,
    isLoading,
    loading,
    deletingNoteId,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    getImageUrl,
    subscribeToNotes,
    unsubscribeFromNotes,
    handleSubmit,
  };
}
