
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovableapp.karaokenight',
  appName: 'box-karaoke-night',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // Configurações para desenvolvimento local
    url: 'http://localhost:8080',
    // Não adicione hosts externos a menos que necessário
    allowNavigation: ['*']
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
