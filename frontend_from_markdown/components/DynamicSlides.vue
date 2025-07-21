<template>
  <div v-if="isError" style="color: red; font-weight: bold">Error loading content.</div>
  <div v-else-if="isLoading" style="color: blue; font-weight: bold">Loading slides...</div>
  <div v-else-if="fileCreated" style="color: green; font-weight: bold">Slides loaded and saved to slides_.md</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isError = ref(false);
const isLoading = ref(true);
const fileCreated = ref(false);

const recordId = '0a9x2h2rg6n2cgw'; // your record ID
const baseUrl = 'http://127.0.0.1:8090';
const markdownContent = ref('');

// Function to save content to file
async function saveToFile(content, filename) {
  try {
    // Create a blob with the content
    const blob = new Blob([content], { type: 'text/markdown' });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error saving file:', error);
    return false;
  }
}

onMounted(async () => {
  try {
    isLoading.value = true;

    // Step 1: fetch the record
    const recordRes = await fetch(`${baseUrl}/api/collections/Markdown/records/${recordId}`);
    if (!recordRes.ok) {
      throw new Error('Failed to load markdown record, status: ' + recordRes.status);
    }

    const record = await recordRes.json();

    // Step 2: build file URL and fetch the .md file content
    const fileName = record.markdown;
    const fileUrl = `${baseUrl}/api/files/Markdown/${recordId}/${fileName}`;

    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      throw new Error('Failed to load markdown file, status: ' + fileRes.status);
    }

    const content = await fileRes.text();
    markdownContent.value = content;

    console.log('Loaded content:\n\n', content.slice(0, 100));

    // Step 3: Save content to slides_.md file
    const saved = await saveToFile(content, 'slides_.md');

    if (saved) {
      fileCreated.value = true;
      console.log('Slides saved to slides_.md');
    } else {
      throw new Error('Failed to save slides to file');
    }

    isError.value = false;
  } catch (error) {
    console.error('Error loading slides:', error);
    isError.value = true;
  } finally {
    isLoading.value = false;
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
