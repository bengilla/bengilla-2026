# BENGILLA Portfolio

A modern portfolio website built with Next.js 14, featuring a CMS for project management.

## Features

- 🎨 Responsive design with multi-language support (11 languages)
- 📱 Mobile-optimized with touch gestures
- 🔐 Secure admin authentication
- 📷 Image upload and management
- 🌐 React Server Components

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bengilla-portfolio.git
cd bengilla-portfolio

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

### Configuration

Edit `.env.local` with your own values:

```env
# Session password (min 32 characters)
# Generate with: openssl rand -base64 32
SESSION_PASSWORD=your-secure-32-character-password-here

# Admin password (change after first login)
ADMIN_PASSWORD=admin123
```

## Usage

- **Homepage**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin
  - Default credentials: `admin` / `admin123`

## Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Security Notes

- Never commit `.env.local` - it's in `.gitignore`
- Never commit `data.json` - contains admin credentials
- Change the default admin password after first login
- Use a secure `SESSION_PASSWORD` (32+ characters)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- React 18
- iron-session
- bcryptjs
- sharp (image processing)
