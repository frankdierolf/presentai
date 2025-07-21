import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import 'dotenv/config'
import { tools } from './tools.js'

const app = new Hono()

// Enable CORS for frontend communication
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3030', 'http://127.0.0.1:3030']

app.use('/*', cors({
  origin: corsOrigins,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}))

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is required')
  process.exit(1)
}

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Generate ephemeral token for OpenAI Realtime API
app.post('/session', async (c) => {
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2025-06-03',
        voice: 'verse',
        tools: tools,
        tool_choice: 'auto',
        instructions: `You are Presento, an AI presentation assistant designed to help speakers during presentations.

VOICE MODE BEHAVIOR:
- When voice is OFF: Only execute navigation tools silently, do not speak
- When voice is ON: Be a helpful conversational assistant who:
  - Answers questions from the presenter directly
  - Provides additional information, facts, and context
  - Helps with audience questions during Q&A
  - Maintains natural conversation flow
  - Responds immediately without introductions or self-references

NAVIGATION COMMANDS (available in both modes):
- "next slide", "previous slide", "go to next", "go to previous"
- Execute navigation immediately when requested

VOICE CONTROL:
- "enable voice", "voice on", "turn on voice" → Enable conversational mode
- "disable voice", "voice off", "turn off voice", "mute" → Return to silent mode

EXAMPLES OF HELPING:
Presenter: "What's the population of India?"
Response: "India has approximately 1.4 billion people, making it the most populous country in the world."

Presenter: "Can you help me with statistics about renewable energy?"
Response: "Sure! What specific renewable energy data are you looking for?"

Presenter: "What about solar energy growth?"
Response: "Solar capacity has grown over 20% annually in recent years, with costs dropping by 90% since 2010."

Keep responses helpful, direct, and professional. Act like a knowledgeable colleague providing quick facts, not a formal AI assistant.`
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return c.json(data)
  } catch (error) {
    console.error('Error creating session:', error)
    return c.json({ error: 'Failed to create session' }, 500)
  }
})

// Tool execution endpoint for slide navigation
app.post('/api/tool/navigate', async (c) => {
  try {
    const { direction } = await c.req.json()
    
    if (!direction || !['next', 'previous'].includes(direction)) {
      return c.json({ error: 'Valid direction (next or previous) is required' }, 400)
    }

    // Log the navigation request
    console.log(`[NAVIGATION] Direction: ${direction.toUpperCase()}`)
    
    // Return success response for the model
    return c.json({ 
      success: true, 
      direction,
      message: `Navigating to ${direction} slide`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error processing navigation:', error)
    return c.json({ error: 'Failed to process navigation' }, 500)
  }
})

// Tool execution endpoint for enabling voice
app.post('/api/tool/enable-voice', async (c) => {
  try {
    // Log the voice enable request
    console.log(`[VOICE] Enabling voice mode`)
    
    // Return success response for the model
    return c.json({ 
      success: true, 
      action: 'enable_voice',
      message: 'Voice mode enabled',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error enabling voice:', error)
    return c.json({ error: 'Failed to enable voice' }, 500)
  }
})

// Tool execution endpoint for disabling voice
app.post('/api/tool/disable-voice', async (c) => {
  try {
    // Log the voice disable request
    console.log(`[VOICE] Disabling voice mode`)
    
    // Return success response for the model
    return c.json({ 
      success: true, 
      action: 'disable_voice',
      message: 'Voice mode disabled',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error disabling voice:', error)
    return c.json({ error: 'Failed to disable voice' }, 500)
  }
})

// Feedback endpoint removed - see docs/FEEDBACK_FEATURE.md for details

const port = parseInt(process.env.PORT || '3000', 10)

serve({
  fetch: app.fetch,
  port: port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
