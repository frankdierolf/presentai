export const slideNavigationTool = {
  type: 'function',
  name: 'navigate_slide',
  description: 'Navigate to the next or previous slide when the user explicitly requests it. Do not provide any verbal response or confirmation.',
  parameters: {
    type: 'object',
    properties: {
      direction: {
        type: 'string',
        description: 'The direction to navigate: next or previous',
        enum: ['next', 'previous'],
      }
    },
    required: ['direction']
  }
}

export const enableVoiceTool = {
  type: 'function',
  name: 'enable_voice',
  description: 'Enable voice audio output from the assistant. When enabled, the user will hear spoken responses.',
  parameters: {
    type: 'object',
    properties: {},
    required: []
  }
}

export const disableVoiceTool = {
  type: 'function',
  name: 'disable_voice',
  description: 'Disable voice audio output from the assistant. When disabled, the assistant will only respond via text/function calls.',
  parameters: {
    type: 'object',
    properties: {},
    required: []
  }
}

export const tools = [slideNavigationTool, enableVoiceTool, disableVoiceTool]