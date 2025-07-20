<template>
  <div v-if="isError" style="color: red; font-weight: bold">Error loading content.</div>
  <Markdown v-else :content="markdownContent" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { marked } from 'marked';

const htmlContent = ref('');
const isError = ref(false);

const recordId = 'ycbat78a0k5bdam'; // your record ID
const baseUrl = 'http://127.0.0.1:8090';
const markdownContent = ref('');

onMounted(async () => {
  try {
    const response = await fetch(`${baseUrl}/api/collections/Markdown/records/${recordId}`);
    if (response.ok) {
      // Step 1: fetch the record
      const recordRes = await fetch(`${baseUrl}/api/collections/Markdown/records/${recordId}`);
      const record = await recordRes.json();

      // Step 2: build file URL
      const fileName = record.markdown;
      const fileUrl = `${baseUrl}/api/files/Markdown/${recordId}/${fileName}`;

      // Step 3: fetch the .md file content
      const fileRes = await fetch(fileUrl);
      const content = await fileRes.text();

      // // Slidev-style split
      // slides.value = content.split(/^---$/gm); // match lines with only ---

      markdownContent.value = content;

      isError.value = false;
    } else {
      throw new Error('Failed to load markdown content, status: ' + response.status);
    }
  } catch (error) {
    htmlContent.value = '';
    isError.value = true;
  }
});
</script>

<!-- <style>
.slide {
  min-height: 100vh;
  padding: 4rem;
  box-sizing: border-box;
  page-break-after: always;
  border-bottom: 2px dashed #333;
}
</style> -->
