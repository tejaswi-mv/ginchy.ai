# OAuth Setup Guide for Ginchy.ai

This guide will help you set up Google OAuth authentication for your Ginchy.ai application using Supabase with the modern @supabase/ssr library.

## Prerequisites

- A Supabase project
- A Google Cloud Console project
- Your application running locally or deployed
- Node.js 18+ and npm/pnpm installed

## Step 1: Install Dependencies

Make sure you have the required Supabase packages installed:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Step 2: Supabase Configuration

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from the project settings

### 2.2 Configure Authentication

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Enable **Google** provider
3. You'll need to add Google OAuth credentials (we'll get these in the next step)

## Step 3: Google Cloud Console Setup

### 3.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API

### 3.2 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application** as the application type
4. Add authorized redirect URIs:
   - For development: `https://your-project-ref.supabase.co/auth/v1/callback`
   - For production: `https://your-domain.com/auth/v1/callback`

### 3.3 Get OAuth Credentials

1. Copy the **Client ID** and **Client Secret**
2. These will be used in your Supabase configuration

## Step 4: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
AUTH_SECRET=your_auth_secret_key

# Database
POSTGRES_URL=your_postgres_connection_string

# Stripe (if using payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

**Important**: Make sure your Supabase keys are complete and not truncated. The anon key should be a long string starting with `eyJ`.

## Step 5: Supabase OAuth Configuration

### 5.1 Add Google OAuth Credentials

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Click on **Google** to configure it
3. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
4. Set the redirect url to: `https://your-project-ref.supabase.co/auth/v1/callback`

### 5.2 Configure Site URL

1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL** to your application URL:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)

## Step 6: Google One Tap Implementation

The application now uses Google One Tap for a seamless authentication experience with the following key components:

### 6.1 Server-Side OAuth Client

The `lib/supabase/server.ts` file uses `@supabase/ssr` for proper server-side cookie handling:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle server component errors gracefully
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle server component errors gracefully
          }
        },
      },
    }
  );
}
```

### 6.2 OAuth Callback Handling

The `finalizeOAuthSession` function properly handles the OAuth callback:

1. Exchanges the authorization code for a session
2. Creates or finds the user in the database
3. Sets up the application session
4. Redirects to the appropriate page

### 6.3 OAuth Callback Component

The `OAuthCallback` component provides better user feedback and error handling:

- Shows loading state during processing
- Displays error messages if something goes wrong
- Handles both success and failure scenarios gracefully

## Step 7: Test the OAuth Flow

### 7.1 Start Your Application

```bash
npm run dev
```

### 7.2 Test OAuth Login

1. Navigate to your application
2. Click "Sign in with Google"
3. Complete the Google OAuth flow
4. You should be redirected back to your application and logged in

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Make sure the redirect URI in Google Cloud Console matches exactly
   - Check that the redirect URI in Supabase matches your application URL

2. **"OAuth session not found" error**
   - Verify your Supabase environment variables are correct and complete
   - Check that the OAuth callback URL is properly configured
   - Ensure the `@supabase/ssr` package is installed

3. **"Invalid request: both auth code and code verifier should be non-empty" error**
   - This usually indicates a PKCE flow issue
   - Make sure you're using the latest version of the Supabase client
   - Check that your environment variables are not truncated

4. **"cookies() should be awaited" error**
   - This is resolved by using the `@supabase/ssr` package
   - Make sure you're using the updated server client implementation

### Debug Steps

1. Check the browser console for any JavaScript errors
2. Check the server logs for authentication errors
3. Verify all environment variables are set correctly and are complete
4. Test with a fresh browser session (incognito mode)
5. Check the OAuth callback URL parameters in the browser

### Environment Variable Validation

Make sure your Supabase keys are complete:

```bash
# Check if your keys are complete
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY
```

The anon key should be a long JWT token starting with `eyJ`.

## Security Notes

- Never commit your `.env.local` file to version control
- Use strong, unique values for `AUTH_SECRET`
- Regularly rotate your API keys
- Monitor your OAuth usage in Google Cloud Console
- Use HTTPS in production

## Next Steps

Once OAuth is working:

1. Set up user roles and permissions
2. Configure email templates in Supabase
3. Set up additional OAuth providers if needed
4. Implement proper error handling and user feedback
5. Add user profile management
6. Set up team management features