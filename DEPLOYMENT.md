# Deployment Guide for GLZ Radio

This guide explains how to deploy the GLZ Radio application to Netlify.

## Prerequisites

- A [Netlify](https://netlify.com) account
- The project files (this repository)

## Deployment Methods

### Method 1: Deploy with Netlify Button (Easiest)

Click the button below to deploy directly to Netlify:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yadielglz/glz-radio)

### Method 2: Manual Deployment via Netlify Dashboard

1. Go to [Netlify](https://netlify.com) and sign in to your account
2. Click "New site from Git" or "Import an existing project"
3. Select your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Netlify to access your repositories
5. Select the repository for GLZ Radio
6. Configure the deployment settings:
   - Branch to deploy: `main` (or `master`)
   - Build command: Leave empty (this is a static site)
   - Publish directory: `./`
7. Click "Deploy site"

### Method 3: Manual Deployment via CLI

1. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to your Netlify account:
   ```bash
   netlify login
   ```

3. Deploy the site:
   ```bash
   netlify deploy
   ```

4. Follow the prompts to select your site or create a new one

5. For a production deployment, use:
   ```bash
   netlify deploy --prod
   ```

## Configuration Details

The project includes a `netlify.toml` file that configures:

- Redirects for PWA routing
- Security headers
- Cache settings for optimal performance

No build step is required as this is a client-side application.

## Post-Deployment Steps

After deployment, you should:

1. Verify the site is working correctly
2. Check that the PWA functionality works:
   - The app should be installable on mobile devices
   - Offline functionality should work
3. Update the site name in the Netlify dashboard if needed
4. Configure a custom domain if desired

## Troubleshooting

If you encounter issues:

1. Ensure all files are in the root directory of your repository
2. Check that the `netlify.toml` file is in the root directory
3. Verify that no build command is set in the Netlify dashboard
4. Check the browser console for any errors

For additional help, refer to the [Netlify documentation](https://docs.netlify.com/).