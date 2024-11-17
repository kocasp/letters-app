
# React Native Expo Project Setup & Deployment

This project has been revitalized several times, requiring the setup of a new React Native Expo app and migration of existing code. Follow these instructions to get started and deploy.

---

## Instructions

1. **Install Packages**  
   Ensure all packages are installed using Expo's install command:
   ```bash
   npx expo install
   ```
   If you encounter a Node.js error, ensure you have a recent Node version installed using `nvm`.

2. **Start Expo**  
   To start the Expo project, run:
   ```bash
   npx expo start
   ```

3. **Install EAS CLI (Expo Application Services)**  
   Install `eas-cli` globally as a build tool:
   ```bash
   npm install -g eas-cli
   ```

4. **Use Yarn Instead of NPM**  
   Always use `yarn` instead of `npm` to ensure `yarn.lock` is updated (and not `package-lock.json`).

---

## Build and Deployment to TestFlight

1. **Run the App on iPhone via Expo**  
   Start Expo and run the app on your iPhone using Expo Go:
   ```bash
   npx expo start
   ```
   - Press `S` to switch to Expo Go mode.
   - Use your phone's camera app to scan the QR code (ensure the Expo Go app is installed).

   **Note:** An active Apple Developer subscription is required.

2. **Build the iOS App**  
   To build for iOS using EAS, run:
   ```bash
   eas build -p ios
   ```

---

This guide ensures a smooth setup, testing, and deployment process for your React Native Expo app!
