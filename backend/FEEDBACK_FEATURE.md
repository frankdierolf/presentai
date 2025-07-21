# Slide Feedback Feature (Archived)

This document archives the implementation of the slide feedback feature that was removed in v0.2.0.

## Why Was It Removed?

The feedback feature was causing instability in the alpha version:
- **Unpredictable Navigation**: AI would sometimes navigate slides without explicit commands
- **Voice Mode Issues**: Voice output would activate even when disabled
- **Complex Content Extraction**: The slide content extraction logic was interfering with core functionality
- **Scope Creep**: Added complexity beyond the core navigation needs

## Original Implementation

### Backend Tool Definition (`tools.ts`)
```typescript
export const getFeedbackTool = {
  type: 'function',
  name: 'get_slide_feedback',
  description: 'Get feedback on the current slide content. This function should be called when the user asks for feedback, suggestions, or opinions about their presentation. The frontend will automatically provide the current slide content.',
  parameters: {
    type: 'object',
    properties: {},
    required: []
  }
}
```

### Backend Endpoint (`index.ts`)
```typescript
// Tool execution endpoint for slide feedback
app.post('/api/tool/feedback', async (c) => {
  try {
    const { slideContent, slideNumber } = await c.req.json()
    
    // Log the feedback request
    console.log(`[FEEDBACK] Getting feedback for slide ${slideNumber}`)
    console.log(`[FEEDBACK] Slide content: ${slideContent?.substring(0, 100)}...`)
    
    // Return success response for the model
    return c.json({ 
      success: true, 
      action: 'get_slide_feedback',
      message: 'Slide feedback requested',
      slideNumber,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error processing feedback:', error)
    return c.json({ error: 'Failed to process feedback request' }, 500)
  }
})
```

### AI Instructions (Removed Section)
```
- For feedback requests: Use get_slide_feedback tool but DO NOT provide slideContent parameter - the frontend will provide the actual current slide content

When using get_slide_feedback, the frontend will automatically extract and provide the current slide content. You should then provide short sassy feedback on whatever content is provided to you.

Be encouraging, specific, and helpful in your feedback while maintaining a funny personality. You can tell dad jokes occasionally. Speak at a fast pace.
```

### Frontend Implementation (`RealtimeButton.vue`)

#### Slide Content Extraction Function (125 lines)
```typescript
// Get current slide content for feedback
function getCurrentSlideContent() {
  try {
    // Use Slidev's navigation API to get current slide data
    const currentSlide = nav.currentSlideRoute.value;

    if (!currentSlide) {
      return 'Unable to access current slide route';
    }

    // Try to get content from the slide metadata
    let slideContent = '';

    // Check if we have slide metadata with content
    if (currentSlide.meta?.slide) {
      const slideData = currentSlide.meta.slide;

      // Try to get the raw content (markdown source)
      if (slideData.content) {
        slideContent = slideData.content;
      }
      // Try to get from note if content is not available
      else if (slideData.note) {
        slideContent = `Note: ${slideData.note}`;
      }
      // Try frontmatter title
      else if (slideData.frontmatter?.title) {
        slideContent = slideData.frontmatter.title;
      }
    }

    // If we still don't have content, try to extract from DOM as fallback
    if (!slideContent || slideContent.trim().length < 5) {
      const slideElement = document.querySelector('.slidev-page');
      if (slideElement) {
        // Clone and clean the element
        const clonedElement = slideElement.cloneNode(true);

        // Remove unwanted elements
        const unwantedSelectors = ['.slidev-nav', '.slidev-controls', 'script', 'style', 'button', '.slidev-icon-btn'];

        unwantedSelectors.forEach((selector) => {
          const elements = clonedElement.querySelectorAll(selector);
          elements.forEach((el) => el.remove());
        });

        slideContent = clonedElement.textContent || clonedElement.innerText || '';
        slideContent = slideContent
          .replace(/\s+/g, ' ')
          .replace(/Welcome to Slidev|Presentation slides for developers|Press Space for next page/gi, '')
          .trim();
      }
    }

    // Clean up markdown syntax if present
    if (slideContent) {
      slideContent = slideContent
        .replace(/^#{1,6}\s+/gm, '') // Remove markdown headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
        .replace(/`(.*?)`/g, '$1') // Remove inline code markdown
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    }

    // Fallback if still no meaningful content
    if (!slideContent || slideContent.length < 10) {
      const slideNumber = nav.currentPage.value;
      slideContent = `This appears to be slide ${slideNumber} with minimal text content, primarily visual elements, or content that couldn't be extracted.`;
    }

    console.log('Extracted slide content:', slideContent);
    return slideContent;
  } catch (error) {
    console.error('Error extracting slide content:', error);
    return `Unable to extract content from slide ${nav.currentPage.value}. This might be a visual-heavy slide.`;
  }
}
```

#### Feedback Handler Function (68 lines)
```typescript
// Handle feedback calls from the model
async function handleFeedbackCall(functionCall) {
  try {
    console.log('Feedback call received:', functionCall);

    // Automatically enable voice mode for feedback
    if (!voiceModeEnabled.value) {
      enableVoiceMode();
    }

    // Get current slide content
    const slideContent = getCurrentSlideContent();
    console.log('Current slide content:', slideContent);
    const slideNumber = nav.currentPage.value;

    addStatusNotification('Analyzing current slide for feedback...', 'info');

    // Execute the feedback tool via backend
    const response = await fetch(`${API_BASE}/api/tool/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slideContent,
        slideNumber,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      // Send function result back to the model with slide content
      const functionResult = {
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: functionCall.call_id,
          output: JSON.stringify({
            ...result,
            slideContent,
            slideNumber,
            instruction: 'Please provide enthusiastic and constructive feedback on this slide content.',
          }),
        },
      };

      dataChannel.send(JSON.stringify(functionResult));

      // Create a new response to get AI feedback
      const responseCreate = {
        type: 'response.create',
      };
      dataChannel.send(JSON.stringify(responseCreate));

      addStatusNotification('Getting AI feedback on your slide...', 'success');
    } else {
      console.error('Feedback execution failed:', result);
      addStatusNotification('Failed to get slide feedback', 'error');
    }
  } catch (error) {
    console.error('Failed to handle feedback call:', error);
    addStatusNotification('Error processing feedback request', 'error');
  }
}
```

## How to Reimplement

If you want to reimplement the feedback feature in the future:

1. **Add the tool back to `tools.ts`**
2. **Restore the endpoint in `index.ts`**
3. **Add the feedback handling back to `RealtimeButton.vue`**
4. **Update AI instructions carefully** to prevent unwanted behaviors:
   - Add explicit trigger words for feedback (e.g., "give me feedback on this slide")
   - Ensure feedback doesn't interfere with navigation commands
   - Test thoroughly to prevent the original issues

### Key Improvements for Future Implementation:
1. **Explicit Triggers**: Require specific phrases like "analyze this slide" or "give feedback"
2. **Separate Voice Control**: Don't auto-enable voice for feedback
3. **Simpler Content Extraction**: Consider a simpler approach to getting slide content
4. **Better Boundaries**: Clear separation between navigation and feedback functionality
5. **Testing**: Extensive testing to ensure stability before release

## Lessons Learned

1. **Keep It Simple**: Start with core functionality and ensure stability
2. **Clear Command Boundaries**: AI needs explicit triggers to prevent confusion
3. **Feature Isolation**: Complex features should be isolated from core functionality
4. **Incremental Development**: Add features one at a time with thorough testing