<template>
  <AppContainer title="Tasks">
    <div v-if="isLoading" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader" class="animate-spin" />
    </div>
    <main  v-else class="max-w-lg mx-auto py-8">
      <form @submit.prevent="handleSubmit">
        <UInput
          ref="newTaskInput"
          v-model="newTask"
          class="w-full"
          size="xl"
          color="neutral"
          variant="soft"
          autofocus
          :autofocus-delay="100"
          placeholder="Remind me to..."
          :loading="loading"
          :ui="{ trailing: 'pe-1', base: 'pe-8' }"
        >
          <template v-if="newTask?.length" #trailing>
            <UPopover>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-calendar"
                size="sm"
              />
              <template #content>
                <UCalendar
                  v-model="selectedDate"
                  size="sm"
                  color="neutral"
                  @update:model-value="handleDateSelect"
                />
              </template>
            </UPopover>
          </template>
        </UInput>
      </form>

      <div
        v-if="tasks.length === 0"
        class="text-center text-sm text-neutral-500 min-h-96 flex items-center flex-col gap-2 justify-center"
      >
        <UIcon name="i-lucide-vote" class="text-neutral-300 text-6xl" />
        <p>You are all done for the day!</p>
      </div>

      <div v-else class="space-y-6 mt-6">
        <!-- // Today tasks -->
        <TaskSection
          v-if="todayTasks.length > 0"
          title="Today"
          :tasks="todayTasks"
          :deleting-task-id="deletingTaskId"
          @toggle="toggleTask"
          @delete="deleteTask"
        />

        <!-- // Tomorrows tasks -->
        <TaskSection
          v-if="tomorrowTasks.length > 0"
          title="Tomorrow"
          :tasks="tomorrowTasks"
          :deleting-task-id="deletingTaskId"
          @toggle="toggleTask"
          @delete="deleteTask"
        />
        <!-- // Future tasks -->
        <TaskSection
          v-if="futureTasks.length > 0"
          title="Future"
          :tasks="futureTasks"
          :deleting-task-id="deletingTaskId"
          :show-dates="true"
          @toggle="toggleTask"
          @delete="deleteTask"
        />
        <!-- // Past tasks -->
        <TaskSection
          v-if="pastTasks.length > 0"
          title="Past"
          :tasks="pastTasks"
          :deleting-task-id="deletingTaskId"
          :show-dates="true"
          @toggle="toggleTask"
          @delete="deleteTask"
        />
      </div>
    </main>
  </AppContainer>
</template>

<script lang="ts" setup>
import { AppContainer } from '#components';

const newTaskInput = ref<HTMLInputElement | null>(null);
const {
  tasks,
  isLoading,
  deletingTaskId,
  loading,
  newTask,
  selectedDate,
  deleteTask,
  toggleTask,
  handleCreateTask,
  fetchTasks,
  subscribeToTasks,
  unsubscribeFromTasks,
} = useTasks();

// Group tasks by date categories
const todayTasks = computed(() => {
  return tasks.value.filter((task) => isToday(new Date(task.date)));
});

const tomorrowTasks = computed(() => {
  return tasks.value.filter((task) => isTomorrow(new Date(task.date)));
});

const futureTasks = computed(() => {
  return tasks.value.filter((task) => {
    const taskDate = new Date(task.date);
    return !isToday(taskDate) && !isTomorrow(taskDate) && taskDate > new Date(); // Ensure the date is in the future
  });
});

const pastTasks = computed(() => {
  return tasks.value.filter((task) => {
    const taskDate = new Date(task.date);
    return taskDate < new Date() && !isToday(taskDate) && !isTomorrow(taskDate);
  });
});

// Date helper functions
const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isTomorrow = (date: Date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
};

onMounted(() => {
  fetchTasks();
  subscribeToTasks();
});

onUnmounted(() => {
  unsubscribeFromTasks();
});

const handleSubmit = async () => {
  const success = await handleCreateTask();
  if (success) {
    // Fix the focus by using nextTick to ensure component is updated
    nextTick(() => {
      const inputElement = newTaskInput.value?.$el?.querySelector('input');
      if (inputElement) {
        inputElement.focus();
      }
    });
  }
};

const handleDateSelect = async () => {
  if (newTask.value.trim()) {
    await handleSubmit();
  }
};
</script>
