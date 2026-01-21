# UK Visa Assistant

Your intelligent guide to UK visa applications - a modern SaaS platform to help users navigate the UK visa process.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database & Auth**: Supabase (planned)
- **Payments**: Stripe (planned)
- **AI**: OpenAI API (planned)
- **Package Manager**: npm

## Project Structure

```
├── app/
│   ├── (auth routes)
│   │   ├── auth/login
│   │   └── auth/signup
│   ├── dashboard/
│   ├── api/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── ui/
├── lib/
│   └── utils.ts
└── public/
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

1. **Clone or navigate to the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example env file
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` and add your actual API keys:
   
   - **Supabase**: Get your project URL and keys from [supabase.com](https://supabase.com)
   - **Stripe**: Get your secret key and webhook secret from [stripe.com](https://stripe.com)
   - **OpenAI**: Get your API key from [platform.openai.com](https://platform.openai.com)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

The following environment variables are required for full functionality:

| Variable | Description | Required For |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Authentication & Database |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (safe for client-side) | Authentication & Database |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Admin operations |
| `STRIPE_SECRET_KEY` | Stripe secret key | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Webhook verification |
| `OPENAI_API_KEY` | OpenAI API key | AI features |

> **Important**: Never commit `.env.local` to version control. This file is gitignored by default.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Next Steps

This is a fresh project scaffold. The following integrations are planned but not yet implemented:

- [ ] Supabase authentication setup
- [ ] Database schema design and migration
- [ ] Stripe subscription integration
- [ ] OpenAI API integration
- [ ] UI components library
- [ ] Business logic implementation

See the project documentation for integration guides (to be added).

## License

Private - Not for distribution
