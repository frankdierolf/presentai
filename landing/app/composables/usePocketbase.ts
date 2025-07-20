import type PocketBase from 'pocketbase';
import type { AuthRecord } from 'pocketbase';

export const usePocketbase = () => {
  const pb = useNuxtApp().$pb as PocketBase;
  const user = ref<(AuthRecord & { avatarUrl: string | null }) | null>(null);

  // Initialize user
  const updateUser = (record: AuthRecord | null) => {
    if (!record) {
      user.value = null;
      return;
    }

    const avatarUrl = record.avatar
      ? pb.files.getURL(record, record.avatar)
      : null;

    user.value = {
      ...record,
      avatarUrl,
    };
  };

  // Initialize with current auth state
  updateUser(pb.authStore.record);

  const signOut = async () => {
    await pb.authStore.clear();
    return navigateTo('/');
  };

  const refreshUser = async () => {
    try {
      // Force refresh the auth store
      await pb.collection('users').authRefresh();
      updateUser(pb.authStore.record);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw createError('Failed to refresh user data');
    }
  };

  return {
    pb,
    user,
    signOut,
    refreshUser,
    updateUser,
  } as const;
};
