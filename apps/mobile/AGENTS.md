# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

This app uses stable Expo SDK 57, React Native 0.86, Expo Router, and TypeScript.
Use Node.js 22.13 or later and install compatible native dependencies with `npx expo install`.

Run `npm run typecheck`, `npm run lint`, `npx expo install --check`, and `npx expo-doctor` after dependency changes.
Use `npm start` or `npx expo start` for Metro and Expo Go. The app does not require `expo-dev-client`.
Push notifications require a native APK and device-specific push service configuration.

Android and iOS folders are generated and ignored. Expo SDK 57 prebuild cleans these folders by default;
inspect local native changes before regenerating them, or use `npx expo prebuild --no-clean` to update in place.
The EAS `preview` profile builds an Android APK using the app configuration.

Import icons from `~/components/icons`. That module uses Tabler's individual runtime exports to
avoid opening the entire icon catalog in Metro on Windows. `src/tabler.d.ts` supplies the missing
subpath declarations using the upstream component type. Preserve the bundled CodeMirror editor
and real backend integrations.
