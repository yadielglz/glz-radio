# Firebase Migration Guide for GLZ Radio

This guide will help you migrate your GLZ Radio app to Firebase for enhanced CORS handling, analytics, and reliability.

## 🚀 Quick Start

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `glz-radio` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Choose your Analytics account or create a new one
6. Click "Create project"

### 2. Enable Firebase Services

In your Firebase project, enable these services:

#### Firebase Hosting
- Go to Hosting in the sidebar
- Click "Get started"
- Install Firebase CLI if you haven't already

#### Firebase Functions
- Go to Functions in the sidebar
- Click "Get started"
- Choose Node.js 18 runtime

#### Firestore Database (Optional)
- Go to Firestore Database in the sidebar
- Click "Create database"
- Choose "Start in test mode" for development

### 3. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 4. Login to Firebase

```bash
firebase login
```

### 5. Initialize Firebase in Your Project

```bash
firebase init
```

Select these options:
- ✅ Hosting
- ✅ Functions
- ✅ Firestore (if you want analytics storage)
- Use existing project
- Select your project
- Public directory: `.` (current directory)
- Configure as single-page app: `Yes`
- Set up automatic builds: `No`

## 📁 File Structure

After setup, your project should look like this:

```
glz-radio/
├── firebase/
│   └── functions/
│       ├── index.js
│       └── package.json
├── js/
│   ├── config-firebase.js
│   ├── player-firebase.js
│   └── ... (existing files)
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── index-firebase.html
└── ... (existing files)
```

## ⚙️ Configuration

### 1. Update Firebase Config

1. Go to Project Settings in Firebase Console
2. Scroll down to "Your apps" section
3. Click the web app icon (</>)
4. Register your app with a nickname
5. Copy the config object

### 2. Update Configuration Files

#### Update `js/config-firebase.js`:
```javascript
const FIREBASE_CONFIG = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-actual-app-id"
};

const FIREBASE_ENDPOINTS = {
    streamProxy: "https://us-central1-your-project-id.cloudfunctions.net/radioStreamProxy",
    weatherProxy: "https://us-central1-your-project-id.cloudfunctions.net/weatherProxy",
    locationProxy: "https://us-central1-your-project-id.cloudfunctions.net/locationProxy",
    analytics: "https://us-central1-your-project-id.cloudfunctions.net/analytics",
    health: "https://us-central1-your-project-id.cloudfunctions.net/health"
};
```

#### Update `index-firebase.html`:
Replace the Firebase config in the script tag with your actual config.

### 3. Install Function Dependencies

```bash
cd firebase/functions
npm install
```

## 🚀 Deployment

### 1. Deploy Firebase Functions

```bash
firebase deploy --only functions
```

### 2. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

### 3. Deploy Everything

```bash
firebase deploy
```

## 🔧 Testing

### 1. Test Firebase Functions Locally

```bash
cd firebase/functions
npm run serve
```

### 2. Test Health Endpoint

Visit: `https://us-central1-your-project-id.cloudfunctions.net/health`

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T...",
  "functions": ["WKAQ 580", "NOTIUNO 630", ...],
  "version": "1.0.0"
}
```

### 3. Test Stream Proxy

Visit: `https://us-central1-your-project-id.cloudfunctions.net/radioStreamProxy?station=WKAQ%20580`

## 📊 Features Enabled

### ✅ CORS Proxy
- All radio streams now go through Firebase Functions
- Automatic fallback to direct URLs if Firebase fails
- Multiple fallback URLs per station

### ✅ Enhanced Weather
- Weather API calls go through Firebase proxy
- Automatic caching and fallback
- Better error handling

### ✅ Analytics
- Track station plays, errors, and usage
- Optional Firestore storage for analytics data
- User agent and app version tracking

### ✅ Health Monitoring
- Health check endpoint for monitoring
- Automatic service availability detection
- Graceful degradation when services are down

### ✅ Error Handling
- Comprehensive error handling with fallbacks
- User-friendly error messages
- Automatic retry mechanisms

## 🔄 Migration Steps

### 1. Backup Current App
```bash
cp index.html index-backup.html
cp js/config.js js/config-backup.js
```

### 2. Replace Files
- Replace `index.html` with `index-firebase.html`
- Replace `js/config.js` with `js/config-firebase.js`
- Add `js/player-firebase.js` to your project

### 3. Update Script References
Make sure your HTML includes the new Firebase scripts in the correct order.

### 4. Test Thoroughly
- Test all stations work with Firebase proxy
- Test fallback to direct URLs
- Test weather functionality
- Test error handling

## 🛠️ Customization

### Add New Stations
1. Add station to `RADIO_STATIONS` in `js/config-firebase.js`
2. Add station to `RADIO_STATIONS` in `firebase/functions/index.js`
3. Deploy functions: `firebase deploy --only functions`

### Modify Analytics
Edit the `logAnalytics` function in `js/player-firebase.js` to track additional events.

### Custom Error Handling
Modify the `showErrorMessage` function to match your app's design.

## 🔍 Monitoring

### Firebase Console
- Go to Functions > Logs to see function execution logs
- Go to Analytics to see usage data (if enabled)
- Go to Hosting to see deployment status

### Health Checks
- Monitor the health endpoint regularly
- Set up alerts for function failures
- Track analytics data for insights

## 🚨 Troubleshooting

### Functions Not Deploying
```bash
cd firebase/functions
npm install
firebase deploy --only functions
```

### CORS Issues
- Check that CORS is properly configured in functions
- Verify function URLs are correct
- Check browser console for CORS errors

### Stream Not Playing
- Check function logs in Firebase Console
- Verify station names match exactly
- Test direct URLs as fallback

### Weather Not Loading
- Check weather function logs
- Verify API keys are correct
- Test fallback weather API

## 📈 Performance Optimization

### Caching
- Weather data is cached for 15 minutes
- Location data is cached for 1 hour
- Station data is cached in browser

### CDN
- Firebase Hosting provides global CDN
- Static assets are automatically optimized
- Automatic compression enabled

### Function Optimization
- Functions use Node.js 18 for better performance
- Automatic scaling based on demand
- Cold start optimization

## 🔐 Security

### Firestore Rules
The provided `firestore.rules` allow:
- Public read access to analytics and stations
- Authenticated write access for admin features
- User-specific data protection

### Function Security
- CORS properly configured
- Input validation on all endpoints
- Error messages don't expose sensitive data

## 📱 PWA Features

Your app maintains all PWA features:
- Offline capability
- Install prompts
- Background sync
- Push notifications (if configured)

## 🎯 Next Steps

1. **Deploy to Firebase Hosting**
2. **Set up custom domain** (optional)
3. **Configure monitoring alerts**
4. **Set up analytics dashboard**
5. **Add more stations** as needed

## 📞 Support

If you encounter issues:
1. Check Firebase Console logs
2. Verify all configuration values
3. Test functions locally first
4. Check browser console for errors

---

**Happy Broadcasting! 🎵** 