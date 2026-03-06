import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.routinetracker.app',
  appName: 'Routine Tracker',
  webDir: 'www',
  server: {
    // Enable this for development to load from a local server
    // url: 'http://localhost:8080',
    // cleartext: true,
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0f1117',
    preferredContentMode: 'mobile',
  },
};

export default config;
