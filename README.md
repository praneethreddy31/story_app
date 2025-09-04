# Idea to Story Engine

A comprehensive platform that transforms creative ideas into compelling stories using AI-powered tools and collaborative features.

## 🚀 Features

- **Conversational AI**: Chat with AI to develop story ideas through natural conversation
- **Project Management**: Create, organize, and manage story projects with sessions
- **Real-time Collaboration**: Live collaboration with multiple authors
- **Version Control**: Track changes and message history with full versioning
- **AI-Powered Story Generation**: Transform ideas into complete narratives
- **Story Templates**: Pre-built templates for different genres
- **Character Development**: AI-assisted character creation and development
- **Plot Structuring**: Intelligent plot suggestions and story arcs
- **Export Options**: Multiple export formats (PDF, EPUB, DOCX)
- **Search & Organization**: Advanced search and filtering capabilities

## 🏗️ Architecture

```
idea-to-story-engine/
├── angular-frontend/  # Angular + Material Design
├── backend/           # Node.js + Express + Prisma
├── ai-service/        # Python + FastAPI + OpenAI
├── shared/            # Shared types and utilities
└── docker/            # Docker configuration
```

## 🛠️ Tech Stack

### Frontend
- **Angular** with Material Design
- **TypeScript** for type safety
- **Angular Material** for modern UI components
- **RxJS** for reactive programming
- **Angular Router** for navigation

### Backend

### Backend
- **Node.js** with Express framework
- **Prisma ORM** with PostgreSQL
- **JWT** for authentication
- **Redis** for caching and sessions
- **Socket.io** for real-time features

### AI Service
- **Python** with FastAPI
- **Gemini API** for conversational AI and story development
- **OpenAI API** for story generation
- **HuggingFace** for additional AI models
- **Celery** for background tasks

### DevOps
- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **AWS/GCP** for cloud deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+
- Redis
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   # For contributors: First fork the repository on GitHub, then:
   git clone https://github.com/YOUR_USERNAME/story_app.git
   cd story_app
   
   # For just running the app:
   git clone https://github.com/praneethreddy31/story_app.git
   cd story_app
   ```

   > 💡 **Want to contribute?** Click the "Fork" button on [GitHub](https://github.com/praneethreddy31/story_app) first, then clone your fork. See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions.

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install dependencies**
   ```bash
   # Angular Frontend
   cd angular-frontend && npm install
   
   # Backend
   cd ../backend && npm install
   
   # AI Service
   cd ../ai-service && pip install -r requirements.txt
   ```

4. **Set up database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start services**
   ```bash
   # Development mode
   npm run dev:all
   
   # Or start individually:
   # Angular Frontend: ng serve (in angular-frontend/)
   # Backend: npm run dev (in backend/)
   # AI Service: uvicorn main:app --reload (in ai-service/)
   ```

## 📁 Project Structure

### Angular Frontend (`/angular-frontend`)
```
angular-frontend/
├── src/
│   ├── app/
│   │   ├── components/     # Angular components
│   │   ├── services/       # API services
│   │   ├── guards/         # Route guards
│   │   └── models/         # TypeScript interfaces
│   ├── assets/             # Static assets
│   └── styles/             # Global styles
```
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── public/            # Static assets
└── package.json
```

### Backend (`/backend`)
```
backend/
├── src/
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Express middleware
│   ├── models/        # Prisma models
│   ├── services/      # Business logic
│   ├── routes/        # API routes
│   └── utils/         # Utility functions
├── prisma/            # Database schema
└── package.json
```

### AI Service (`/ai-service`)
```
ai-service/
├── app/
│   ├── models/        # AI models
│   ├── services/      # AI services
│   ├── api/           # API endpoints
│   └── utils/         # Utility functions
├── requirements.txt
└── main.py
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/story_engine"

# JWT
JWT_SECRET="your-jwt-secret"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Gemini
GEMINI_API_KEY="your-gemini-api-key"

# Redis
REDIS_URL="redis://localhost:6379"

# Frontend
VITE_API_URL="http://localhost:3001"
VITE_AI_SERVICE_URL="http://localhost:8000"
```

## 🧪 Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# AI Service tests
cd ai-service && pytest
```

## 🚀 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Manual Deployment
1. Build Angular frontend: `cd angular-frontend && npm run build`
2. Start backend: `cd backend && npm start`
3. Start AI service: `cd ai-service && uvicorn main:app`

## 🤝 Contributing

We welcome contributions from the community! Here's how you can get started:

### Quick Start for Contributors
1. **Fork the repository** on GitHub by clicking the "Fork" button at the top-right
2. **Clone your fork** locally: `git clone https://github.com/YOUR_USERNAME/story_app.git`
3. **Create a feature branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes** and add tests
5. **Submit a pull request** to the main repository

### Detailed Instructions
For comprehensive setup instructions, development guidelines, and contribution best practices, please see our [CONTRIBUTING.md](CONTRIBUTING.md) file.

### Ways to Contribute
- 🐛 **Report bugs** or suggest features via [GitHub Issues](https://github.com/praneethreddy31/story_app/issues)
- 💻 **Submit code** improvements or new features
- 📖 **Improve documentation** to help other developers
- 🧪 **Add tests** to increase code coverage
- 🎨 **Enhance UI/UX** for better user experience

### Getting Help
- Check out issues labeled `good first issue` for beginner-friendly tasks
- Join discussions in the [GitHub Discussions](https://github.com/praneethreddy31/story_app/discussions) section
- Review the [CONTRIBUTING.md](CONTRIBUTING.md) for detailed setup instructions

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@ideatostory.com or create an issue in the repository.
