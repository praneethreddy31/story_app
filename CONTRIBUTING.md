# Contributing to Idea to Story Engine

Thank you for your interest in contributing to the Idea to Story Engine! This document provides detailed instructions on how to fork, set up, and contribute to this project.

## 🍴 How to Fork This Repository

### Option 1: GitHub Web Interface (Recommended for beginners)
1. **Navigate to the repository**: Go to [https://github.com/praneethreddy31/story_app](https://github.com/praneethreddy31/story_app)
2. **Click the Fork button**: In the top-right corner of the page, click the "Fork" button
3. **Choose your account**: Select where you want to fork the repository (your personal account or organization)
4. **Wait for the fork**: GitHub will create a copy of the repository in your account

### Option 2: GitHub CLI
```bash
# Install GitHub CLI first: https://cli.github.com/
gh repo fork praneethreddy31/story_app --clone
```

### Option 3: Manual Git Clone (after forking via web)
```bash
# Replace YOUR_USERNAME with your GitHub username
git clone https://github.com/YOUR_USERNAME/story_app.git
cd story_app

# Add the original repository as upstream
git remote add upstream https://github.com/praneethreddy31/story_app.git
```

## 🚀 Setting Up Your Fork for Development

### Prerequisites
- Node.js 18+ ([Download here](https://nodejs.org/))
- Python 3.9+ ([Download here](https://www.python.org/downloads/))
- PostgreSQL 14+ ([Download here](https://www.postgresql.org/download/))
- Redis ([Download here](https://redis.io/downloads/))
- Git ([Download here](https://git-scm.com/downloads/))

### 1. Clone Your Fork
```bash
git clone https://github.com/YOUR_USERNAME/story_app.git
cd story_app
```

### 2. Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
# You'll need to add your API keys and database connection strings
```

### 3. Install Dependencies

#### Frontend (Angular)
```bash
cd frontend
npm install
cd ..
```

#### Backend (Node.js + Express)
```bash
cd backend
npm install
cd ..
```

#### AI Service (Python)
```bash
cd ai-service
pip install -r requirements.txt
cd ..
```

### 4. Set Up Database
```bash
cd backend
npx prisma migrate dev
npx prisma generate
cd ..
```

### 5. Start Development Servers

#### Option 1: Start All Services
```bash
# If there's a dev:all script in the root package.json
npm run dev:all
```

#### Option 2: Start Services Individually
```bash
# Terminal 1 - Frontend
cd frontend
npm start

# Terminal 2 - Backend
cd backend
npm run dev

# Terminal 3 - AI Service
cd ai-service
uvicorn main:app --reload
```

## 🔄 Keeping Your Fork Updated

### Sync with Upstream
```bash
# Fetch the latest changes from the original repository
git fetch upstream

# Switch to your main branch
git checkout main

# Merge the changes
git merge upstream/main

# Push the updates to your fork
git push origin main
```

## 🛠️ Making Contributions

### 1. Create a Feature Branch
```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Your Changes
- Follow the existing code style and conventions
- Write clear, concise commit messages
- Add tests for new functionality
- Update documentation if needed

### 3. Test Your Changes

#### Frontend Tests
```bash
cd frontend
npm test
```

#### Backend Tests
```bash
cd backend
npm test
```

#### AI Service Tests
```bash
cd ai-service
pytest
```

#### Linting
```bash
cd backend
npm run lint
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "Add: brief description of your changes"
```

### 5. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request
1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the pull request template
4. Submit the pull request

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows the project's style guidelines
- [ ] Self-review of the code has been performed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Corresponding changes to documentation have been made
- [ ] Changes generate no new warnings
- [ ] Tests have been added that prove the fix is effective or that the feature works
- [ ] New and existing unit tests pass locally

### Pull Request Template
When creating a pull request, please include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality

## Screenshots (if applicable)
Add screenshots to show the visual changes
```

## 🎯 Areas Where We Need Contributions

### High Priority
- Bug fixes and performance improvements
- UI/UX enhancements
- Test coverage improvements
- Documentation improvements

### Features We'd Love to See
- Additional export formats
- New story templates
- Character development tools
- Plot structure suggestions
- Mobile responsiveness improvements

### AI/ML Enhancements
- Better story generation algorithms
- Character consistency improvements
- Genre-specific templates
- Language support

## 🔍 Finding Issues to Work On

1. Check the [Issues tab](https://github.com/praneethreddy31/story_app/issues)
2. Look for labels like:
   - `good first issue` - Great for beginners
   - `help wanted` - We need community help
   - `bug` - Bug reports that need fixing
   - `enhancement` - New features to implement

## 💬 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: For private concerns or security issues

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.

## 🙏 Recognition

All contributors will be recognized in our README.md file. Thank you for helping make the Idea to Story Engine better!

---

**Need help getting started?** Don't hesitate to ask questions in the GitHub Issues or Discussions section. The community is here to help! 🚀