
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.45a37de93bab46e5863830a7532e3cec',
  appName: 'box-karaoke-night',
  webDir: 'dist',
  server: {
    url: 'https://45a37de9-3bab-46e5-8638-30a7532e3cec.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Filesystem: {
      accessible: true,
      androidPermissions: [
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.READ_MEDIA_IMAGES',
        'android.permission.READ_MEDIA_VIDEO',
        'android.permission.READ_MEDIA_AUDIO',
        'android.permission.MANAGE_EXTERNAL_STORAGE'
      ]
    }
  },
  android: {
    allowMixedContent: true,
    allowBackup: true,
    appendUserAgent: "TVBoxApp",
    requestLegacyExternalStorage: true
  }
};

export default config;
