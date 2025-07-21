export const slideNavigationTool = {
  type: 'function',
  name: 'navigate_slide',
  description: 'Navigate to the next or previous slide. Use this ONLY when the user explicitly says: "next slide", "previous slide", "go to next", "go to previous", "navigate next", "navigate previous". Do not navigate for any other reason.',
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
  description: 'Enable voice audio output. Use this ONLY when the user explicitly says: "enable voice", "turn on voice", "voice on", "speak to me", "audio on".',
  parameters: {
    type: 'object',
    properties: {},
    required: []
  }
}

export const disableVoiceTool = {
  type: 'function',
  name: 'disable_voice',
  description: 'Disable voice audio output. Use this ONLY when the user explicitly says: "disable voice", "turn off voice", "voice off", "stop speaking", "audio off", "mute".',
  parameters: {
    type: 'object',
    properties: {},
    required: []
  }
}

export const tools = [slideNavigationTool, enableVoiceTool, disableVoiceTool]
