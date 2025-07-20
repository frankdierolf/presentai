import type { TasksResponse } from '@@/pocketbase-types';

import { getLocalTimeZone, today } from '@internationalized/date';
import * as chrono from 'chrono-node';


export const useTasks = () => {
  const { pb, user } = usePocketbase();
  const tasks = ref<TasksResponse[]>([]);
  const isLoading = ref(true);
  const deletingTaskId = ref<string | null>(null);
  const loading = ref(false);
  const newTask = ref('');
  const selectedDate = shallowRef(today(getLocalTimeZone()));
  const toast = useToast();
  const { freeLimits } = useRuntimeConfig().public;

  const fetchTasks = async () => {
    try {
      isLoading.value = true;
      tasks.value = await pb.collection('tasks').getFullList<TasksResponse>({
        sort: '-created',
        expand: 'user',
      });
    } catch (error) {
      console.error(error);
      throw createError('Failed to fetch tasks');
    } finally {
      isLoading.value = false;
    }
  };

  const createTask = async (formData: FormData) => {
    try {
      await pb.collection('tasks').create(formData);
    } catch (error) {
      console.error(error);
      throw createError('Failed to create task');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      deletingTaskId.value = taskId;
      await pb.collection('tasks').delete(taskId);
    } catch (error) {
      console.error(error);
      throw createError('Failed to delete task');
    } finally {
      deletingTaskId.value = null;
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      const task = tasks.value.find((t) => t.id === taskId);
      if (!task) return;

      await pb.collection('tasks').update(taskId, {
        completed: !task.completed,
      });
    } catch (error) {
      console.error(error);
      throw createError('Failed to toggle task');
    }
  };

  const parseDateFromText = (text: string) => {
    const parsedDate = chrono.parseDate(text);
    if (!parsedDate) return { text, date: null };

    // Remove the date part from the text
    const dateText = chrono.parse(text)[0]?.text || '';
    const cleanText = text.replace(dateText, '').trim();

    return {
      text: cleanText,
      date: parsedDate,
    };
  };

  const handleCreateTask = async () => {
    if (!newTask.value.trim()) return;

    try {
      loading.value = true;

      if (!user.value?.pro_account && tasks.value.length >= freeLimits.tasks) {
        toast.add({
          title: 'You have reached the free limit for tasks',
          description: 'Please subcribe to create unlimited tasks',
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
        return;
      }

      // Parse date from text
      const { text: cleanText, date: parsedDate } = parseDateFromText(newTask.value);

      const formData = new FormData();
      formData.append('title', cleanText);
      formData.append('completed', 'false');
      formData.append('user', user.value?.id ?? '');
      formData.append(
        'date',
        (parsedDate || selectedDate.value.toDate(getLocalTimeZone())).toISOString()
      );

      await createTask(formData);
      newTask.value = '';
      selectedDate.value = today(getLocalTimeZone());
      return true;
    } catch (error) {
      console.error(error);
      throw createError('Failed to create task');
    } finally {
      loading.value = false;
    }
  };

  const subscribeToTasks = () => {
    pb.collection('tasks').subscribe('*', async (e) => {
      if (tasks.value) {
        if (e.action === 'create') {
          tasks.value = [e.record as TasksResponse, ...tasks.value];
        } else if (e.action === 'delete') {
          tasks.value = tasks.value.filter((task) => task.id !== e.record.id);
        } else if (e.action === 'update') {
          tasks.value = tasks.value.map((task) =>
            task.id === e.record.id ? (e.record as TasksResponse) : task
          );
        }
      }
    });
  };

  const unsubscribeFromTasks = () => {
    pb.collection('tasks').unsubscribe();
  };

  return {
    tasks,
    isLoading,
    deletingTaskId,
    loading,
    newTask,
    selectedDate,
    fetchTasks,
    createTask,
    deleteTask,
    toggleTask,
    handleCreateTask,
    subscribeToTasks,
    unsubscribeFromTasks,
  };
};
