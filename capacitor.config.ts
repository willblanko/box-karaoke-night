
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovableapp.karaokenight',
  appName: 'box-karaoke-night',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystoreAlias: 'key0',
      keystorePassword: 'android',
      keystoreKeyPassword: 'android',
    }
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false
    }
  },
  loggingBehavior: 'debug'
};

export default config;
