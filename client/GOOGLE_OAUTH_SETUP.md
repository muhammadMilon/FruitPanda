# Google OAuth Setup Guide

This guide will help you set up Google OAuth for the Fruit Panda application so users can log in with their Google accounts.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Fruit Panda OAuth")
5. Click "Create"

### 2. Enable Google+ API

1. In your new project, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google Identity" or "Google+ API"
4. Click "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: "Fruit Panda"
   - User support email: Your email
   - Developer contact information: Your email
   - Save and continue through the steps

### 4. Configure OAuth 2.0 Client ID

1. Application type: "Web application"
2. Name: "Fruit Panda Web Client"
3. Authorized redirect URIs: Add `http://localhost:3000/api/auth/google/callback`
4. Click "Create"

### 5. Copy Credentials

After creating the OAuth 2.0 Client ID, you'll see:
- **Client ID** (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

### 6. Configure Environment Variables

1. Create a `.env` file in the `project/server/` directory (if it doesn't exist)
2. Add the following variables:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:5173
```

Replace `your-client-id-here` and `your-client-secret-here` with the actual values from step 5.

### 7. Restart the Server

After adding the environment variables, restart your backend server:

```bash
npm run server:dev
```

### 8. Test Google Login

1. Start your frontend application: `npm run dev`
2. Go to the login page
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you should be redirected back to the application

## Troubleshooting

### Common Issues

1. **"Google OAuth is not configured" error**
   - Make sure you've created the `.env` file in the correct location
   - Verify the environment variable names are correct
   - Restart the server after adding environment variables

2. **"Invalid redirect URI" error**
   - Make sure the redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/api/auth/google/callback`
   - Check for typos in the URI

3. **"Access blocked" error**
   - Make sure you've enabled the Google+ API
   - Check that your OAuth consent screen is properly configured

4. **"Client ID not found" error**
   - Verify you're using the correct Client ID
   - Make sure the Client ID is copied exactly as shown in Google Cloud Console

### Security Notes

- Never commit your `.env` file to version control
- Keep your Client Secret secure
- For production, use HTTPS URLs in redirect URIs
- Consider adding additional authorized domains for production

## Production Setup

For production deployment:

1. Add your production domain to authorized redirect URIs
2. Use HTTPS URLs
3. Configure proper OAuth consent screen for production
4. Set up proper environment variables on your hosting platform

## Support

If you encounter issues:

1. Check the server console for error messages
2. Verify all environment variables are set correctly
3. Ensure the Google Cloud Console configuration matches this guide
4. Check that both frontend and backend servers are running 