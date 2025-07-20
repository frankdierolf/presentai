# 🎯 PresentAI

> **AI-Powered Presentation Platform with Real-time Voice Control**

PresentAI is a cutting-edge presentation platform that combines OpenAI's latest AI models with real-time voice control, automated content generation, context awareness, and intelligent interactive chat navigation. Built for the Berlin AI Hackathon, it represents the future of presentation software.

## ✨ Features

### 🎤 **Real-time Voice Assistant**
- **Voice-controlled slide navigation** "next slide", "previous slide", "enable voice"
- **Conversational AI** powered by GPT-4o-mini
- **Message feedback system** (like/dislike)
- **Public chat sharing** with read-only links
- **Auto-titling** for conversations

### 📄 **Automated Content Generation**
- **PDF-to-Slides conversion** using n8n workflows
- **AI-powered summarization** and content structuring
- **Slidev-compatible output** with professional formatting
- **Batch processing pipeline** for document automation

### 🏢 **Enterprise Features**
- **Stripe subscription billing** with free/pro tiers
- **User authentication** and management
- **Usage analytics** and limits
- **File storage** and management
- **Real-time synchronization** across devices
- **Customer data storage** with PocketBase

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AI Services   │
│                 │    │                 │    │                 │
│ • Slidev (Vue)  │◄──►│ • Hono.js API   │◄──►│ • GPT-4o Real.  │
│ • Dashboard     │    │ • PocketBase    │    │ • GPT-4o        │
│ • Upload UI     │    │ • n8n Workflows │    │ • GPT-4o-mini   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tech Stack

**Frontend:**
- 🖼️ **Slidev** - Vue.js presentation framework
- 🏠 **Nuxt.js** - Dashboard and user interface
- ⚛️ **React** - File upload components
- 🎨 **TailwindCSS** - Styling and design

**Backend:**
- ⚡ **Hono.js** - High-performance API server
- 🗄️ **PocketBase** - Database and authentication
- 🔄 **n8n** - Workflow automation
- 💳 **Stripe** - Payment processing

**AI & APIs:**
- 🤖 **OpenAI GPT-4o Realtime** - Voice processing
- 🧠 **OpenAI GPT-4o** - Content generation  
- 💬 **OpenAI GPT-4o-mini** - Chat conversations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm/pnpm
- OpenAI API key
- Stripe account (optional, for billing)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/frankdierolf/presentai.git
cd presentai
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend (Slidev)
cd ../frontend
npm install

# Landing page
cd ../landing
npm install

# Upload interface
cd ../generate_presentation/upload-file
npm install
```

3. **Environment setup**
```bash
# Backend environment
cd backend
cp .env.example .env
# Add your OpenAI API key to .env
```

4. **Start services**

**Terminal 1 - Backend API:**
```bash
cd backend
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Slidev Presentation:**
```bash
cd frontend  
npm run dev
# Runs on http://localhost:3030
```

**Terminal 3 - Dashboard (optional):**
```bash
cd landing
npm run dev  
# Runs on http://localhost:3000
```

**Terminal 4 - n8n Workflows (optional):**
```bash
cd generate_presentation/n8n-local
npm start
# Runs on http://localhost:5678
```

### 🎤 Voice Control Setup

1. Open the Slidev presentation at `http://localhost:3030`
2. Navigate to the "Realtime" slide  
3. Click "🗣️ Enable Voice Commands"
4. Allow microphone access when prompted
5. Wait for "Voice commands ready!" status
6. Try saying: "next slide" or "previous slide"

## 📖 Usage Guide

### Voice Commands

| Command | Action | Example |
|---------|--------|---------|
| "next slide" | Navigate forward | "go to next slide" |
| "previous slide" | Navigate backward | "go back" |
| "enable voice" | Turn on AI voice responses | "turn on voice mode" |
| "disable voice" | Turn off AI voice responses | "silent mode" |

### AI Chat

1. Access the dashboard at `/dashboard/ai-chat`
2. Create a new chat conversation
3. Type messages to interact with GPT-4o-mini
4. Use feedback buttons to rate responses
5. Share conversations publicly if needed

### PDF-to-Slides Generation

1. Upload a PDF file via the upload interface
2. The n8n workflow processes the document
3. AI extracts and summarizes content
4. Generates Slidev-compatible markdown
5. Download or view the generated presentation

## 🔧 Development

### Project Structure

```
presentai/
├── backend/                 # Hono.js API server
│   ├── src/
│   │   ├── index.ts        # Main server file
│   │   └── tools.ts        # AI function definitions
│   └── package.json
├── frontend/               # Slidev presentation
│   ├── components/
│   │   └── RealtimeButton.vue
│   ├── slides.md          # Presentation content
│   └── package.json
├── landing/               # Nuxt.js dashboard
│   ├── app/
│   │   ├── pages/         # Dashboard pages
│   │   ├── components/    # UI components
│   │   └── composables/   # Vue composables
│   └── package.json
├── generate_presentation/ # Content generation
│   ├── n8n-workflow.json # Automation workflow
│   └── upload-file/      # React upload UI
├── pocketbase/           # Database & auth
│   └── pb_hooks/        # Backend hooks
└── README.md
```

### Environment Variables

```bash
# Backend (.env)
OPENAI_API_KEY=your_openai_api_key
PORT=3000

# PocketBase
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Frontend (runtime config)
POCKETBASE_URL=http://localhost:8090
```

### AI Tools Development

The AI function tools are defined in `backend/src/tools.ts`:

```typescript
export const slideNavigationTool = {
  type: 'function',
  name: 'navigate_slide',
  description: 'Navigate to the next or previous slide when the user explicitly requests it.',
  parameters: {
    type: 'object',
    properties: {
      direction: {
        type: 'string',
        enum: ['next', 'previous']
      }
    },
    required: ['direction']
  }
}
```

### Adding New AI Functions

1. Define the tool in `backend/src/tools.ts`
2. Add the API endpoint in `backend/src/index.ts`
3. Handle the function call in `frontend/components/RealtimeButton.vue`
4. Update the tools array export

## 🚀 Deployment

### Backend Deployment

```bash
cd backend
npm run build
npm start
```

### Frontend Deployment

```bash
# Slidev
cd frontend
npm run build
npm run export

# Landing page
cd landing
npm run build
```

### Docker Support (Future)

```dockerfile
# Example Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Monitoring & Analytics

### Built-in Analytics
- User engagement tracking
- AI tool usage metrics
- Performance monitoring
- Error logging

### Available Endpoints
- `GET /api/health` - Health check
- `POST /session` - Create OpenAI session
- `POST /api/tool/navigate` - Handle navigation
- `POST /api/tool/enable-voice` - Enable voice mode
- `POST /api/tool/disable-voice` - Disable voice mode

## 🔐 Security

### Authentication
- JWT-based user authentication
- PocketBase secure session management
- API key protection

### Data Protection
- Encrypted data storage
- HTTPS enforcement
- Input validation and sanitization
- Rate limiting

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for type safety
- Follow ESLint configuration
- Write comprehensive tests
- Document new features
- Maintain backward compatibility

## 📝 API Documentation

### Voice Assistant API

```typescript
// Navigation function call
POST /api/tool/navigate
{
  "direction": "next" | "previous"
}

// Response
{
  "success": true,
  "direction": "next",
  "message": "Navigating to next slide",
  "timestamp": "2025-01-27T..."
}
```

### Chat API

```typescript
// Send message
POST /ai-chat/{chatId}
{
  "messages": [
    {"role": "user", "content": "Hello"}
  ]
}

// Response  
{
  "message": {
    "role": "assistant", 
    "content": "Hello! How can I help you?"
  }
}
```

## 🎯 Roadmap

### Version 2.0
- [ ] AI Image Generation integration
- [ ] Multi-language support
- [ ] Advanced presentation templates
- [ ] Collaborative editing
- [ ] Mobile app

### Version 3.0
- [ ] Custom AI model training
- [ ] Advanced analytics dashboard
- [ ] Enterprise SSO integration
- [ ] API marketplace
- [ ] White-label solutions

## 🐛 Troubleshooting

### Common Issues

**Voice commands not working:**
- Check microphone permissions
- Verify OpenAI API key
- Ensure WebRTC connection is established
- Check browser compatibility

**PDF processing fails:**
- Verify n8n workflow is running
- Check file size limits
- Ensure PDF is text-based (not scanned)

**Database connection errors:**
- Verify PocketBase is running
- Check authentication tokens
- Confirm network connectivity

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* npm run dev

# Check API health
curl http://localhost:3000/api/health
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Berlin AI Hackathon** for the inspiration
- **OpenAI** for the amazing Realtime API
- **Slidev** for the presentation framework
- **Vue.js & Nuxt.js** communities
- All contributors and testers

## 📞 Support

- 📧 Email: support@presentai.dev
- 💬 Discord: [Join our community](https://discord.gg/presentai)
- 🐛 Issues: [GitHub Issues](https://github.com/frankdierolf/presentai/issues)
- 📖 Docs: [Documentation](https://docs.presentai.dev)

---

**Built with ❤️ for the future of presentations**

*PresentAI - Where AI meets presentation excellence*
