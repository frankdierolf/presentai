<template>
  <div class="relative h-32 w-full">
    <!-- Flying boxes -->
    <div
      v-for="(box, index) in boxes"
      :key="index"
      class="bg-white/90 border border-neutral-200 rounded-2xl absolute h-24 w-24 z-20 transition-all duration-1000 flex items-center justify-center"
      :class="[
        box.isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-75',
      ]"
      :style="getBoxStyle(box)"
    >
      <UIcon :name="box.icon" class="h-12 w-12" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Box {
  startX: number;
  startY: number;
  isAnimating: boolean;
  icon: string;
  finalRotation: number; // Added for final rotation
}

const socialIcons = [
  'i-skill-icons-instagram',
  'i-devicon-linkedin',
  'i-logos-facebook',
  'i-ri-twitter-x-fill',
  'i-logos-pinterest',
  'i-logos-bluesky',
  'i-logos-tiktok-icon',
  'i-logos-twitter',
];

const boxes = ref(
  Array.from({ length: socialIcons.length }, (_, index) => ({
    startX: Math.random() * 100 - 50, // Random X position (-50 to 50)
    startY: Math.random() * 100 - 50, // Random Y position (-50 to 50)
    isAnimating: false,
    icon: socialIcons[index], // Use index to ensure each icon is used once
    finalRotation: Math.random() * 20 - 10, // Random rotation between -10 and 10 degrees
  }))
);

// Function to calculate box styles with initial and final rotation
const getBoxStyle = (box: Box) => {
  return {
    left: '50%',
    top: '50%',
    transform: box.isAnimating
      ? `translate(-50%, -50%) rotate(${box.finalRotation}deg)` // Final position with slight random rotation
      : `translate(calc(${box.startX}vw - 50%), calc(${
          box.startY
        }vh - 50%)) rotate(${Math.random() * 360}deg)`, // Starting position with random rotation
  };
};

// Start animation with staggered timing and initial delay
onMounted(() => {
  setTimeout(() => {
    boxes.value.forEach((box, index) => {
      setTimeout(() => {
        box.isAnimating = true;
      }, index * 100); // Stagger between each box
    });
  }, 100); // Initial delay before animation starts
});
</script>
