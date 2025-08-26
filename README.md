# Survey Project Frontend

Modern, AI-powered survey creation and management platform built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### 🎯 Core Features
- **AI-Powered Survey Creation**: Automatic survey generation with artificial intelligence
- **Multiple Question Types**: 11 different question types (text, multiple choice, rating, date, location, etc.)
- **Ready-to-Use Templates**: Pre-built templates for contact forms, events, party invitations, etc.
- **Real-Time Preview**: Live preview while creating surveys
- **Multi-Language Support**: Turkish and English language support
- **Responsive Design**: Mobile and desktop compatible modern interface

### 🔐 Authentication
- **Multiple Login Options**:
  - Email/Password login
  - Google OAuth integration
  - Trello integration
  - Jira integration
- **Secure Session Management**: JWT token-based authentication
- **Admin Panel**: Administrator login and log viewing

### 🎨 User Interface
- **Modern Design**: Glassmorphism and gradient effects
- **Animations**: Smooth transitions with Framer Motion
- **Theme Support**: Light/dark theme and customizable colors
- **Interactive Elements**: Hover effects and micro-animations

### 📊 Survey Management
- **Survey Creation**: Drag-and-drop form builder
- **Question Management**: Add, edit, delete, and duplicate questions
- **Image Upload**: Survey background image upload
- **Status Management**: Draft, active, archived states
- **Categories and Tags**: Survey categorization system

### 🤖 AI Integration
- **Smart Survey Creation**: Automatic survey creation from description
- **Question Suggestions**: AI-powered question recommendations
- **Analysis and Insights**: Survey performance analysis
- **Optimization**: AI-powered survey improvement suggestions

## 🛠️ Technology Stack

### Frontend
- **React 19.1.1**: Modern React hooks and functional components
- **TypeScript**: Type safety and developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library

### UI Libraries
- **@headlessui/react**: Accessible UI components
- **@heroicons/react**: SVG icon library
- **Lucide React**: Modern icon set
- **@react-oauth/google**: Google OAuth integration

### State Management
- **React Context API**: Global state management
- **Local Storage**: User preferences and temporary data storage

### HTTP Client
- **Axios**: RESTful API communication
- **Interceptors**: Request/response processing

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.tsx      # Main layout component
│   ├── Navbar.tsx      # Navigation bar
│   └── ProtectedRoute.tsx # Protected route component
├── contexts/           # React Contexts
│   ├── AuthContext.tsx # Authentication context
│   ├── LanguageContext.tsx # Language management context
│   └── ThemeContext.tsx # Theme management context
├── pages/              # Page components
│   ├── Home.tsx        # Home page
│   ├── Forms.tsx       # Survey list
│   ├── FormBuilder.tsx # Survey builder
│   ├── FormResponse.tsx # Survey response
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Settings.tsx    # Settings page
│   └── ...
├── services/           # API services
│   ├── api.ts         # Axios configuration
│   ├── authService.ts # Authentication service
│   ├── surveyService.ts # Survey service
│   ├── aiService.ts   # AI service
│   ├── questionService.ts # Question service
│   └── ...
└── assets/            # Static files
```

## 🚀 Installation

### Requirements
- Node.js 18+ 
- npm or yarn

### Steps

1. **Clone the project**
```bash
git clone <repository-url>
cd survey-project-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Build preview
npm run preview

# Linting
npm run lint
```

## 🌐 API Integration

### Backend Connection
- **Base URL**: `http://localhost:5000/api`
- **Proxy**: CORS issues resolved with Vite proxy
- **Authentication**: Bearer token authentication

### Main Endpoints
- `POST /api/AI/generate-complete-survey` - AI survey creation
- `GET /api/Surveys/get-all` - Get all surveys
- `POST /api/Surveys` - Create new survey
- `PUT /api/Surveys/:id` - Update survey
- `DELETE /api/Surveys/:id` - Delete survey

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones (blue-500, indigo-600)
- **Secondary**: Purple tones (purple-500, pink-500)
- **Success**: Green tones (green-500, emerald-600)
- **Warning**: Orange tones (orange-500, amber-500)
- **Error**: Red tones (red-500, rose-500)

### Typography
- **Font Family**: System fonts (Inter, -apple-system, BlinkMacSystemFont)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- **Base Unit**: 4px (Tailwind default)
- **Container**: max-width 7xl (1280px)
- **Padding**: 4, 6, 8, 12, 16, 20, 24

## 🌍 Multi-Language Support

### Supported Languages
- **Turkish (tr)**: Default language
- **English (en)**: Full translation support

### Translation System
- Context API-based language management
- Language preference storage with LocalStorage
- Dynamic text updates
- 500+ translation keys

## 🔐 Security

### Authentication
- JWT token-based session management
- Automatic token refresh
- Secure logout process
- Protected routes

### Data Security
- HTTPS requirement (production)
- XSS protection
- CSRF token support
- Input validation

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
- Touch-friendly buttons
- Swipe gestures
- Optimized form inputs
- Mobile-first approach
