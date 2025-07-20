# PresentAI Landing Page

Landing page for PresentAI built with Nuxt 4 and Pocketbase integration.

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Deployment on Coolify

### Prerequisites
- Coolify instance running
- Public GitHub repository access
- Pocketbase service deployed (for backend integration)

### Deployment Steps

1. **Import Repository in Coolify**
   - Go to your Coolify dashboard
   - Click "New Resource" → "Public Repository"
   - Enter your repository URL
   - Select "Docker Compose" as the build method

2. **Configure Environment Variables**
   Set these environment variables in Coolify dashboard:
   ```bash
   # Pocketbase connection (adjust to your pocketbase service URL)
   NUXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase-domain.com
   
   # Optional: Custom app URL
   NUXT_PUBLIC_APP_URL=https://your-landing-domain.com
   ```

3. **Deploy**
   - Click "Deploy" in Coolify
   - Wait for the Docker build and deployment to complete
   - Your landing page will be available at your configured domain

### Features
- Nuxt 4 with Vue 3 composition API
- TailwindCSS for styling
- Pocketbase integration for authentication and data
- Responsive design optimized for all devices
- SSR/SPA hybrid rendering

### Architecture
- **Frontend**: Nuxt 4 application
- **Styling**: TailwindCSS + Nuxt UI
- **Backend**: Connects to Pocketbase service
- **Deployment**: Docker container on Coolify

### Troubleshooting

**Build Issues with Nixpacks:**
If you encounter `oxc-parser` native binding errors, use Docker Compose deployment instead of Nixpacks. This is a known issue with Nuxt 4 on Nixpacks environments.

**Pocketbase Connection:**
Ensure the `NUXT_PUBLIC_POCKETBASE_URL` environment variable points to your deployed Pocketbase instance.
