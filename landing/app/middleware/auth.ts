export default defineNuxtRouteMiddleware(() => {
  const toast = useToast();
  const { pb } = usePocketbase();
  if (!pb.authStore.isValid) {
    toast.add({
      title: 'You are not logged in',
      description: 'Please login to continue',
      color: 'error',
    });
    return navigateTo('/');
  }
});
