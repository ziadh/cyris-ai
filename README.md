# Cyris AI

An intelligent AI chat platform that automatically routes your queries to the best AI model for optimal results. Built with Next.js, TypeScript, and powered by multiple leading AI providers.

## ✨ What is Cyris AI?

Cyris AI is a smart AI assistant platform that takes the guesswork out of choosing the right AI model. Instead of manually selecting between different AI providers, Cyris AI analyzes your query and automatically routes it to the most suitable model based on the task type, complexity, and requirements.

## 🚀 Key Features

### 🧠 Smart Auto-Pick Technology
- **Intelligent Routing**: Automatically selects the best AI model for your specific query
- **Multi-Modal Support**: Handles text, images, and complex reasoning tasks
- **Optimized Performance**: Routes to the most cost-effective and capable model for each task

### 🎯 Multiple AI Models
- **GPT-4o Mini**: Fast and efficient for everyday tasks, conversations, and simple queries
- **Gemini 2.5 Flash**: Advanced reasoning, multimodal inputs, and safety-critical queries  
- **Llama 4 Scout**: Creative brainstorming, open-ended conversations, and idea generation
- **GPT-Image-1**: High-quality image generation (BYOK required)

### 💬 Advanced Chat Features
- **Persistent Chat History**: Save and resume conversations
- **Share Conversations**: Generate shareable links for your chats
- **Real-time Streaming**: Live response streaming for better user experience
- **Message Management**: Edit, delete, and organize your conversations

### 🔐 Security & Privacy
- **Secure Authentication**: Google OAuth integration via NextAuth
- **BYOK (Bring Your Own Key)**: Use your own API keys for specific features
- **Encrypted Storage**: API keys are encrypted and stored locally
- **Session Management**: Secure user sessions and data protection

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Real-time Updates**: Live chat interface with smooth animations
- **Intuitive Controls**: Easy-to-use model selection and settings

## 🛠️ Tech Stack

- **Frontend**: React 19, Next.js 15 (App Router), TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB with Mongoose
- **AI Integration**: OpenRouter API, OpenAI API
- **Deployment**: Vercel/Cloudflare Pages support

## 📋 Prerequisites

Before setting up Cyris AI, ensure you have:

- **Node.js** 18.17 or later
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- **MongoDB** database (Atlas recommended)
- **Google Cloud Console** project for OAuth
- **OpenRouter** account and API key

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenRouter API (Required)
OPENROUTER_API_KEY=your_openrouter_api_key_here
PUBLIC_API_URL=http://localhost:3000

# Database (Required)
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/cyris-ai

# NextAuth Configuration (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_super_secret_key_here

# Google OAuth (Required)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ziadh/cyris-ai.git
cd cyris-ai
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Configure each variable as described in the [Environment Setup](#environment-setup) section below.

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Environment Setup

### OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for an account
3. Navigate to API Keys section
4. Generate a new API key
5. Add credits to your account for usage

### MongoDB Database

1. Create a [MongoDB Atlas](https://www.mongodb.com/atlas) account
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string and replace `<username>` and `<password>`
5. Add your IP address to the whitelist

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set application type to "Web application"
6. Add authorized origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### NextAuth Secret

Generate a secure random string for NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

## 🎯 Usage

### Basic Chat
1. Sign in with your Google account
2. Start typing your message
3. Choose "Auto-pick best model" or select a specific model
4. Send your message and get intelligent responses

### Image Generation
1. Select "GPT-Image-1" model
2. Configure your OpenAI API key in settings (BYOK)
3. Type your image description
4. Generate high-quality images

### Sharing Conversations
1. Click the share button in any chat
2. Generate a public shareable link
3. Share with others (no authentication required to view)

## 📁 Project Structure

```
cyris-ai/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── shared/            # Shared chat pages
│   └── page.tsx           # Main chat interface
├── components/            # React components
│   ├── ChatInput.tsx      # Message input component
│   ├── ChatMessages.tsx   # Messages display
│   ├── ChatSidebar.tsx    # Chat history sidebar
│   └── ...               # Other components
├── lib/                   # Utility libraries
│   ├── ai.ts             # AI service integration
│   ├── auth.ts           # NextAuth configuration
│   ├── mongodb.ts        # Database connection
│   └── utils.ts          # Helper functions
├── models/               # Database models
│   └── Chat.ts           # Chat model schema
└── types/                # TypeScript definitions
```

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### Cloudflare Pages

1. Build the project:
   ```bash
   npm run pages:build
   ```
2. Deploy:
   ```bash
   npm run deploy
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/ziadh/cyris-ai/issues) page
2. Create a new issue with detailed description
3. Visit the developer's portfolio at [ziadhussein.com](https://ziadhussein.com)

## 🔮 Coming Soon

- **Custom Routing Rules**: Train the system to route queries your way
- **More AI Providers**: Integration with additional AI services
- **Advanced Analytics**: Usage statistics and model performance metrics
- **Team Collaboration**: Share workspaces and collaborate on projects

---

**🔗 Links:**
- 🌟 **Live Demo**: [cyris-ai.vercel.app](https://cyris-ai.vercel.app)
- 💻 **GitHub Repository**: [github.com/ziadh/cyris-ai](https://github.com/ziadh/cyris-ai)
- 👨‍💻 **Developer Portfolio**: [ziadhussein.com](https://ziadhussein.com)

Built with ❤️ by [Ziad Hussein](https://ziadhussein.com) using Next.js and powered by leading AI providers.
