<template>
  <div>
    <div class="flex items-center justify-between mx-3 text-sm">
      <p>{{ title }}</p>
      <span
        class="text-neutral-500 h-5 w-5 rounded-md bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center"
        >{{ tasks.length }}</span
      >
    </div>
    <ul
      v-auto-animate
      class="bg-neutral-100 dark:bg-neutral-950 rounded-2xl p-1 space-y-1 mt-2"
    >
      <li
        v-for="task in tasks"
        :key="task.id"
        :class="[
          'flex items-start sm:items-center gap-2 bg-white dark:bg-neutral-900 p-2 rounded-md group',
          {
            '!rounded-t-xl': task === tasks[0],
            '!rounded-b-xl': task === tasks[tasks.length - 1],
          },
        ]"
      >
        <div class="checkbox-wrapper-15">
          <input
            :id="`cbx-${task.id}`"
            class="inp-cbx"
            type="checkbox"
            style="display: none"
            :checked="task.completed"
            :disabled="deletingTaskId === task.id"
            @change="$emit('toggle', task.id)"
          />
          <label class="cbx" :for="`cbx-${task.id}`">
            <span>
              <svg width="12px" height="9px" viewbox="0 0 12 9">
                <polyline points="1 5 4 8 11 1" />
              </svg>
            </span>
          </label>
        </div>
        <div class="flex-1 flex items-center">
          <p
            class="text-sm"
            :class="{ 'line-through text-neutral-400': task.completed }"
          >
            {{ task.title }}
          </p>
          <div v-if="showPriority && task.priority" class="ml-2">
            <UBadge
              :color="getPriorityColor(task.priority)"
              variant="subtle"
              size="xs"
            >
              {{ task.priority }}
            </UBadge>
          </div>
        </div>
        <div
          v-if="showDates && shouldShowDate(task.date)"
          class="text-xs text-neutral-400 mr-2"
        >
          {{ useDateFormat(task.date, 'D MMM').value }}
        </div>
        <UButton
          color="error"
          variant="ghost"
          icon="i-lucide-trash"
          size="sm"
          class="opacity-10 group-hover:opacity-100 transition-opacity"
          :loading="deletingTaskId === task.id"
          :disabled="deletingTaskId === task.id"
          @click="$emit('delete', task.id)"
        />
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import type { TasksResponse } from '@@/pocketbase-types';
import { useDateFormat } from '@vueuse/core';

defineProps({
  title: {
    type: String,
    required: true,
  },
  tasks: {
    type: Array as PropType<TasksResponse[]>,
    required: true,
  },
  deletingTaskId: {
    type: String,
    default: null,
  },
  showDates: {
    type: Boolean,
    default: false,
  },
  showPriority: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['toggle', 'delete']);

const getPriorityColor = (priority: string) => {
  if (priority === 'low') return 'neutral';
  if (priority === 'medium') return 'warning';
  return 'error';
};

const shouldShowDate = (date: string) => {
  const taskDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return taskDate.getTime() !== today.getTime();
};
</script>

<style scoped>
.checkbox-wrapper-15 .cbx {
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}
.checkbox-wrapper-15 .cbx span {
  display: inline-block;
  vertical-align: middle;
  transform: translate3d(0, 0, 0);
}
.checkbox-wrapper-15 .cbx span:first-child {
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 0.35rem;
  transform: scale(1);
  vertical-align: middle;
  border: 1px solid #b9b8c3;
  transition: all 0.2s ease;
}
.checkbox-wrapper-15 .cbx span:first-child svg {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  fill: none;
  stroke: white;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 16px;
  stroke-dashoffset: 16px;
  transition: all 0.3s ease;
  transition-delay: 0.1s;
}
.checkbox-wrapper-15 .cbx span:first-child:before {
  content: '';
  width: 100%;
  height: 100%;
  background: var(--ui-color-primary-500);
  display: block;
  transform: scale(0);
  opacity: 1;
  border-radius: 0.75rem;
  transition-delay: 0.2s;
}
.checkbox-wrapper-15 .cbx:hover span:first-child {
  border-color: var(--ui-color-primary-500);
}

.checkbox-wrapper-15 .inp-cbx:checked + .cbx span:first-child {
  border-color: var(--ui-color-primary-500);
  background: var(--ui-color-primary-500);
  animation: check-15 0.6s ease;
}
.checkbox-wrapper-15 .inp-cbx:checked + .cbx span:first-child svg {
  stroke-dashoffset: 0;
}
.checkbox-wrapper-15 .inp-cbx:checked + .cbx span:first-child:before {
  transform: scale(2.2);
  opacity: 0;
  transition: all 0.6s ease;
}

@keyframes check-15 {
  50% {
    transform: scale(1.2);
  }
}

/* Dark mode support */
:root.dark .checkbox-wrapper-15 .cbx span:first-child {
  border-color: var(--ui-color-neutral-500);
}
:root.dark .checkbox-wrapper-15 .cbx:hover span:first-child {
  border-color: var(--ui-color-primary-500);
}
:root.dark .checkbox-wrapper-15 .inp-cbx:checked + .cbx span:first-child {
  border-color: var(--ui-color-primary-500);
  background: var(--ui-color-primary-500);
}
</style>
