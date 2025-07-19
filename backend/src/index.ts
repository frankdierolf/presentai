import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import 'dotenv/config'

const app = new Hono()

// Enable CORS for frontend communication
app.use('/*', cors({
  origin: ['http://localhost:3030', 'http://127.0.0.1:3030'], // Slidev default port
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
        tools: [
          {
            type: 'function',
            name: 'navigate_slide',
            description: 'Navigate to the next or previous slide when the user explicitly requests it.',
            parameters: {
              type: 'object',
              properties: {
                direction: {
                  type: 'string',
                  description: 'The direction to navigate: next or previous',
                  enum: ['next', 'previous'],
                },
                confirmation: {
                  type: 'string',
                  description: 'Confirmation message about the navigation action',
                }
              },
              required: ['direction']
            }
          }
        ],
        tool_choice: 'auto'
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
    const { direction, confirmation } = await c.req.json()
    
    if (!direction || !['next', 'previous'].includes(direction)) {
      return c.json({ error: 'Valid direction (next or previous) is required' }, 400)
    }

    // Log the navigation request
    console.log(`[NAVIGATION] Direction: ${direction.toUpperCase()}${confirmation ? ` - ${confirmation}` : ''}`)
    
    // Return success response for the model
    return c.json({ 
      success: true, 
      direction,
      message: confirmation || `Navigating to ${direction} slide`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error processing navigation:', error)
    return c.json({ error: 'Failed to process navigation' }, 500)
  }
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
