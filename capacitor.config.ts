
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovableapp.karaokenight',
  appName: 'box-karaoke-night',
  webDir: 'dist',
  server: {
    url: 'https://45a37de9-3bab-46e5-8638-30a7532e3cec.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystoreAlias: 'key0',
      keystorePassword: 'android',
      keystoreKeyPassword: 'android',
    }
  }
};

export default config;
