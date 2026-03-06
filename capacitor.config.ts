import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.routinetracker.app',
  appName: 'Routine Tracker',
  webDir: 'www',
  server: {
    iosScheme: 'https',
    androidScheme: 'https',
    hostname: 'localhost',
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0f1117',
    preferredContentMode: 'mobile',
  },
};

export default config;
