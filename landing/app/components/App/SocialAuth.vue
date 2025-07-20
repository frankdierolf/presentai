<template>
  <div class="grid grid-cols-2 gap-2">
    <UButton
      block
      color="neutral"
      size="lg"
      :loading="isLoadingGoogle"
      class="cursor-pointer"
      :icon="isLoadingGoogle ? 'i-lucide-loader' : 'i-logos-google-icon'"
      @click="loginWithGoogle"
    >
      Google
    </UButton>
    <UButton
      block
      color="neutral"
      size="lg"
      :loading="isLoadingGithub"
      class="cursor-pointer"
      :icon="isLoadingGithub ? 'i-lucide-loader' : 'i-mdi-github'"
      @click="loginWithGithub"
    >
      GitHub
    </UButton>
  </div>
</template>

<script lang="ts" setup>
const { pb } = usePocketbase();
const isLoadingGoogle = ref(false);
const isLoadingGithub = ref(false);
const toast = useToast();

// Pre-create window reference for iOS
let authWindow: Window | null = null;

// Generic OAuth handler to reduce code duplication
const handleOAuthLogin = async (
  provider: 'google' | 'github',
  loadingRef: Ref<boolean>
) => {
  try {
    loadingRef.value = true;
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    // For iOS, open window before async operation
    if (isIOS) {
      authWindow = window.open('');
    }

    const authData = await pb.collection('users').authWithOAuth2({
      provider,
      urlCallback: (url) => {
        if (isIOS && authWindow) {
          authWindow.location.href = url;
        } else {
          const popup = window.open(url, 'oauth', 'width=600,height=800');
          if (!popup) {
            throw createError(
              'Failed to open login popup. Please allow popups for this site.'
            );
          }
        }
      },
    });

    if (authData) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await navigateTo('/dashboard');
    }
  } catch (error) {
    loadingRef.value = false;
    toast.add({
      title: 'Login error',
      description: error.message,
    });
    console.error('Login error:', error);
  } finally {
    loadingRef.value = false;
  }
};

const loginWithGoogle = () => handleOAuthLogin('google', isLoadingGoogle);
const loginWithGithub = () => handleOAuthLogin('github', isLoadingGithub);
</script>
