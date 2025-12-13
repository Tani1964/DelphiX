# DelphiX Healthcare Platform

A comprehensive healthcare platform built with Next.js, featuring drug verification, AI-powered symptom diagnosis, hospital recommendations, and emergency SOS features.

## Features

- 🔐 **Authentication**: Email/password and Google OAuth
- 💊 **Drug Verification**: Verify drugs via NAFDAC code, image, or text (External API → IPFS → Database)
- 🤖 **AI Chat Diagnosis**: Symptom analysis with text, audio, and image support
- 🏥 **Hospital Recommendations**: Find nearby hospitals based on symptoms
- 🆘 **SOS Feature**: Emergency assistance with activity monitoring
- 📊 **Admin Dashboard**: Analytics and user management
- 📝 **Diagnosis History**: Track and review past diagnoses

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MongoDB Atlas account (free tier)
- Google Cloud account (for Vision API and Maps)
- OpenRouter API key (for AI chat)
- OpenAI API key (for audio transcription)
- Pinata account (for IPFS, optional)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Google Cloud APIs
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# AI Services
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=google/gemini-2.5-flash
OPENAI_API_KEY=your_openai_api_key

# IPFS (Optional - for drug verification)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up your environment variables (see above)

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Services Used

- **OpenRouter**: AI chat conversations (Gemini 2.5 Flash)
- **OpenAI Whisper**: Audio transcription
- **Google Cloud Vision API**: Image analysis (1,000 free requests/month)
- **Google Maps API**: Hospital location and mapping
- **IPFS (Pinata)**: Decentralized drug record storage
- **MongoDB Atlas**: Database (free tier available)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
