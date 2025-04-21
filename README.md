# Celebration Central

An AI-powered event planning platform that helps you create and manage memorable celebrations with ease.

## Features

- AI-powered event suggestions and planning assistance
- Comprehensive event management system
- Vendor marketplace and booking
- Real-time chat with vendors
- Secure payment processing
- Responsive design for all devices

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Firebase (Authentication & Database)
- OpenAI API
- Shadcn UI Components

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/parth10811/celebration-central.git
   cd celebration-central
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your API keys and configuration values in the `.env` file.

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=your-openai-api-key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful components
- [OpenAI](https://openai.com/) for the AI capabilities
- [Firebase](https://firebase.google.com/) for backend services
