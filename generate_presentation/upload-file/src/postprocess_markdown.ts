import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export async function processAndUploadPresentation(presentationData: { presentation: string; summary: string; fileName: string }) {
  try {
    // Extract the markdown content from the presentation string
    // Remove the ```markdown wrapper if it exists

    let markdownContent = presentationData.presentation;
    if (markdownContent.startsWith('```markdown\n')) {
      markdownContent = markdownContent.replace('```markdown\n', '').replace('```', '');
    }

    // Create a Blob/File from the markdown content
    const markdownFile = new File([markdownContent], `${presentationData.fileName}.md`, {
      type: 'text/markdown',
    });

    // Upload to PocketBase
    const createdRecord = await pb.collection('Markdown').create({
      markdown: [markdownFile],
    });

    console.log('Created record:', createdRecord);
    return createdRecord;
  } catch (error) {
    console.error('Error uploading presentation:', error);
    throw error;
  }
}
