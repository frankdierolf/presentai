export const slideNavigationTool = {
  type: 'function',
  name: 'navigate_slide',
  description: 'Navigate to the next or previous slide when the user requests navigation. Common phrases: "next slide", "previous slide", "go to next", "go to previous", "move forward", "go back".',
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
  description: 'Enable conversational voice mode where Presento becomes an active assistant. Triggered by: "enable voice", "voice on", "turn on voice", "activate Presento".',
  parameters: {
    type: 'object',
    properties: {},
    required: []
  }
}

export const disableVoiceTool = {
  type: 'function',
  name: 'disable_voice',
  description: 'Disable voice mode and return to silent navigation-only mode. Triggered by: "disable voice", "voice off", "turn off voice", "mute", "silent mode".',
  parameters: {
    type: 'object',
    properties: {},
    required: []
  }
}

export const tools = [slideNavigationTool, enableVoiceTool, disableVoiceTool]
