import type { FilesResponse } from '@@/pocketbase-types';

// Shared state outside the composable to prevent duplicate fetches
const sharedState = {
  files: ref<FilesResponse[]>([]),
  isLoading: ref(false),
  isInitialized: ref(false),
  unsubscribe: null as (() => void) | null,
  componentCount: 0,
};

export function useFileManager() {
  const { pb } = usePocketbase();
  const deletingFileId = ref<string | null>(null);

  const fetchFiles = async () => {
    // Prevent duplicate fetches
    if (sharedState.isLoading.value) return;
    
    try {
      sharedState.isLoading.value = true;
      sharedState.files.value = await pb.collection('files').getFullList<FilesResponse>({
        sort: '-created',
        expand: 'user',
      });
    } catch (error) {
      console.error(error);
      throw createError('Failed to fetch files');
    } finally {
      sharedState.isLoading.value = false;
    }
  };

  const createFile = async (formData: FormData) => {
    try {
      await pb.collection('files').create(formData);
    } catch (error) {
      console.error(error);
      throw createError('Failed to create file');
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      deletingFileId.value = fileId;
      await pb.collection('files').delete(fileId);
    } catch (error) {
      console.error(error);
      throw createError('Failed to delete file');
    } finally {
      deletingFileId.value = null;
    }
  };

  const getFileUrl = (file: FilesResponse) => {
    return file.file ? pb.files.getURL(file, file.file) : null;
  };

  // Track component instances
  sharedState.componentCount++;

  // Initialize only once
  if (!sharedState.isInitialized.value) {
    sharedState.isInitialized.value = true;
    
    // Initial fetch
    fetchFiles();
    
    // Subscribe only once
    sharedState.unsubscribe = pb.collection('files').subscribe('*', async (e) => {
      if (sharedState.files.value) {
        if (e.action === 'create') {
          sharedState.files.value = [e.record as FilesResponse, ...sharedState.files.value];
        } else if (e.action === 'delete') {
          sharedState.files.value = sharedState.files.value.filter((file) => file.id !== e.record.id);
        } else if (e.action === 'update') {
          sharedState.files.value = sharedState.files.value.map((file) =>
            file.id === e.record.id ? (e.record as FilesResponse) : file
          );
        }
      }
    });
  }

  onUnmounted(() => {
    sharedState.componentCount--;
    
    // Only unsubscribe when the last component unmounts
    if (sharedState.componentCount === 0 && sharedState.unsubscribe) {
      pb.collection('files').unsubscribe();
      sharedState.unsubscribe = null;
      sharedState.isInitialized.value = false;
    }
  });

  return {
    files: sharedState.files,
    isLoading: sharedState.isLoading,
    deletingFileId,
    createFile,
    deleteFile,
    getFileUrl,
  };
}
