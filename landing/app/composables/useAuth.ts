import { z } from 'zod';

export const loginUserSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
});

export const registerUserSchema = z
  .object({
    name: z.string().min(1).max(100),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ['passwordConfirm'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const useAuth = () => {
  const { pb } = usePocketbase();
  const toast = useToast();
  const loading = ref(false);

  const login = async (data: z.output<typeof loginUserSchema>) => {
    loading.value = true;
    try {
      await pb.collection('users').authWithPassword(data.email, data.password);
      return navigateTo('/dashboard');
    } catch (error) {
      let errorMessage;
      if (
        error?.message ===
        `The request doesn't satisfy the collection requirements to authenticate.`
      ) {
        errorMessage =
          'You have not been verified yet. Please check your email for a verification link.';
      } else {
        errorMessage = error?.message;
      }
      toast.add({
        title: 'Error',
        description: errorMessage,
        color: 'error',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const register = async (data: z.output<typeof registerUserSchema>) => {
    loading.value = true;
    try {
      await pb.collection('users').create(data);
      toast.add({
        title: 'Account created',
        description: 'Please check your email and verify your account.',
        color: 'success',
      });
      await pb.collection('users').requestVerification(data.email);
      return navigateTo('/auth/login');
    } catch (error) {
      toast.add({
        title: 'Error',
        description: error?.message,
        color: 'error',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const forgotPassword = async (
    data: z.output<typeof forgotPasswordSchema>
  ) => {
    loading.value = true;
    try {
      await pb.collection('users').requestPasswordReset(data.email);
      toast.add({
        title: 'Success',
        description: 'Password reset email sent',
        color: 'success',
      });
    } catch (error) {
      toast.add({
        title: 'Error',
        description: error?.message,
        color: 'error',
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    login,
    register,
    forgotPassword,
    loading,
    loginUserSchema,
    registerUserSchema,
    forgotPasswordSchema,
  };
};
