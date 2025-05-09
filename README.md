# React Native Expo Authentication App

A React Native application built with Expo that includes authentication features and a beautiful UI.

## Features

- User authentication (Sign up and Login)
- Email verification
- Firebase integration for data storage
- Beautiful gradient background
- Responsive design
- Android 10+ compatibility

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Firebase account

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase project and enable Authentication and Firestore
4. Update the Firebase configuration in `firebaseConfig.js` with your Firebase credentials

## Running the App

1. Start the development server:
   ```bash
   npx expo start
   ```

2. Use the Expo Go app on your Android device to scan the QR code, or press 'a' to open in an Android emulator

## Project Structure

- `/components` - Reusable components
- `/screens` - Screen components
- `/context` - Context providers
- `firebaseConfig.js` - Firebase configuration
- `App.js` - Main application file

## Dependencies

- @react-navigation/native
- @react-navigation/native-stack
- firebase
- react-native-screens
- react-native-safe-area-context
- @react-native-async-storage/async-storage
- react-native-gesture-handler
- expo-linear-gradient

## Notes

- The app is configured to work with Android 10 and above
- Firebase is used as the backend service
- The app includes email verification during signup
- Cache is cleared on exit 