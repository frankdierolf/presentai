# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PresentAI is a presentation application built for the Berlin AI hackathon. It consists of:
- **Backend**: Node.js/TypeScript API server using Hono framework (port 3000)
- **Frontend**: Slidev-based presentation framework with Vue 3 components

## Key Commands

### Backend Development
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start development server with hot reload (tsx)
npm run build        # Compile TypeScript to JavaScript
npm start            # Run production build
```

### Frontend Development
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start Slidev development server
npm run build        # Build for production
npm run export       # Export slides
```

## Architecture Overview

### Backend Structure
- **Framework**: Hono (lightweight web framework)
- **Language**: TypeScript with ESNext target and NodeNext modules
- **Entry Point**: `src/index.ts` - Currently basic setup with "Hello Hono!" endpoint
- **Configuration**: JSX support enabled for Hono's JSX renderer

### Frontend Structure
- **Framework**: Slidev (Vue-based presentation framework)
- **Main Content**: `slides.md` - Markdown file containing presentation slides
- **Custom Components**: Located in `components/` directory
  - `Counter.vue` - Interactive counter component
  - `RealtimeButton.vue` - Suggests real-time functionality (not yet connected to backend)
- **Theme**: Seriph theme with customizable styling
- **Deployment**: Configured for Netlify and Vercel with SPA routing

## OpenAI Realtime API Integration

### Setup Requirements
1. **Environment Variables**: Create `/backend/.env` with your OpenAI API key:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

2. **Backend**: Provides ephemeral token generation and tool execution
   - `POST /session` - Generates ephemeral tokens for WebRTC authentication
   - `POST /api/tool/navigate` - Executes slide navigation tool calls
   - `GET /api/health` - Health check endpoint

3. **Frontend**: RealtimeButton component with full WebRTC integration
   - Voice-to-voice conversation with GPT-4o Realtime
   - Automatic speech detection and audio handling
   - Tool call support for slide navigation
   - Integration with Slidev navigation system

### Usage
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev` 
3. Navigate to your Slidev presentation
4. Use `<RealtimeButton />` component in slides
5. Click "Connect to AI" to start voice conversation
6. Say "please go to the next slide" or "go to the previous slide" to test navigation

### Tool Functions
The AI assistant can call the `navigate_slide` function with:
- `direction`: Navigation direction (`next` or `previous`)
- `confirmation`: Optional confirmation message about the navigation action

**Important**: The AI will only call the navigation function when users explicitly request slide navigation using phrases like:
- "Please go to the next slide"
- "Go to the previous slide"
- "Move to the next slide"
- "Navigate to the previous slide"

## Development Considerations

1. **API Integration**: ✅ **IMPLEMENTED** - RealtimeButton component now fully integrated with OpenAI Realtime API via WebRTC.

2. **TypeScript**: Both frontend and backend use TypeScript. Maintain type safety across the stack.

3. **Slidev Features**: The frontend leverages Slidev's capabilities including:
   - Markdown-based slides with embedded Vue components
   - Code highlighting and live coding
   - Presenter mode and speaker notes

4. **Security**: Backend uses ephemeral tokens for client-side authentication. Keep your OpenAI API key secure.

5. **No Testing Setup**: Currently no test framework is configured. Consider adding tests as the project grows.

6. **Deployment**: Frontend is ready for static hosting. Backend will need separate deployment configuration and environment variable management.