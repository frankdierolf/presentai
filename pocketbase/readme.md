# Supersaas Pocketbase Template

Build fullstack apps with pocketbase and vue 3.

## Features

- [x] Authentication
- [x] Authorization
- [x] Database
- [x] Beautiful UI
- [x] Email verification
- [x] Forgot password
- [x] Reset password
- [x] Change password
- [x] Logout
- [x] User settings
- [x] Tasks Demo
- [x] File Manager Demo
- [x] Notes app Demo
- [x] AI Chat Demo
- [x] AI Image Generation Demo (Trained on your own images)

## Tech Stack

- [Pocketbase](https://pocketbase.io/)
- [Vue 3](https://vuejs.org/)
- [Tailwind CSS V4](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

## How to use

### Local Development
1. Clone the repository and download pocketbase here
2. Just run pocketbase serve and the app will be available on http://localhost:8090

### Production Deployment on Coolify

#### Prerequisites
- Coolify instance running
- Public GitHub repository access
- Required environment variables

#### Deployment Steps

1. **Import Repository in Coolify**
   - Go to your Coolify dashboard
   - Click "New Resource" → "Public Repository"
   - Enter your repository URL
   - Select "Docker Compose" as the build method

2. **Configure Environment Variables**
   Set these required environment variables in Coolify dashboard:
   ```bash
   # Required for AI chat functionality
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Generate 32-character encryption key
   PB_ENCRYPTION_KEY=your_32_character_encryption_key
   
   # Stripe configuration (for payment webhooks)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   
   # Optional: Custom app URL
   APP_URL=https://yourdomain.com
   ```

   Generate encryption key with: `openssl rand -hex 16`

3. **Deploy**
   - Click "Deploy" in Coolify
   - Wait for the build and deployment to complete
   - Your Pocketbase instance will be available at your configured domain

4. **Post-Deployment**
   - Access your admin panel at `https://yourdomain.com/_/`
   - Set up your admin account
   - Verify all webhooks and integrations are working

#### Features Available After Deployment
- Full authentication system
- AI chat with OpenAI integration
- Stripe payment processing
- File uploads and management
- All existing pb_hooks functionality

#### Backup Strategy
Your data is automatically persisted in Docker volumes. For additional backup:
- Set up automated database exports
- Configure file storage backups
- Monitor application health via Coolify dashboard
