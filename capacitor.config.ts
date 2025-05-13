
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
      keystorePath: 'C:\\Users\\Willian\\Documents\\GitHub\\box-karaoke-night\\android\\app\\keystore.jks',
      keystoreAlias: 'key0',
      keystorePassword: 'android',
      keystoreKeyPassword: 'android',
      signingType: 'apksigner'
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
