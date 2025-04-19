
# Karaoke Box - Aplicativo para TV Box Android

Aplicativo de karaoke projetado especificamente para TV Box Android, com suporte a reprodução de vídeos de um pendrive USB.

## Requisitos Técnicos

- TV Box Android (versão 6.0 ou superior)
- Pendrive USB com vídeos de karaoke
- Resolução de tela: 720p ou 1080p

## Preparação do Pendrive USB

1. Crie uma pasta chamada `karaoke` na raiz do pendrive
2. Adicione arquivos de vídeo de karaoke no formato `.mp4` dentro desta pasta
3. Os arquivos de vídeo devem seguir a nomenclatura numérica (ex: 1001.mp4, 1002.mp4) que corresponde aos IDs das músicas no catálogo

## Instalação e Execução

### Desenvolvimento

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Adicione a plataforma Android: `npx cap add android`
4. Sincronize o projeto: `npx cap sync`
5. Construa o aplicativo: `npm run build`
6. Execute no emulador: `npx cap run android`

### Implantação em TV Box

1. Gere o APK: `npm run build && npx cap build android`
2. Transfira o APK para o dispositivo usando um cabo USB ou via ADB:
   ```
   adb install -r ./android/app/build/outputs/apk/release/app-release.apk
   ```
3. Em caso de permissões de acesso ao USB, certifique-se de que o APK possui permissão para acessar o armazenamento externo

## Configuração do Android

### Permissões necessárias

Adicione as seguintes permissões ao `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />
<uses-feature android:name="android.software.leanback" android:required="false" />
<uses-feature android:name="android.hardware.touchscreen" android:required="false" />
```

### Configuração para TV Box

1. Abra o projeto Android no Android Studio
2. Edite o `AndroidManifest.xml` para incluir:

```xml
<application
    ...
    android:banner="@drawable/banner"
    ...>
    
    <activity
        ...
        android:screenOrientation="landscape">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
            <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
        </intent-filter>
    </activity>
</application>
```

## Estrutura do Projeto

- `src/lib/file-system.ts`: Gerencia a leitura do catálogo de músicas e acesso aos arquivos
- `src/components/`: Componentes da interface do usuário
- `src/context/KaraokeContext.tsx`: Gerencia o estado global do aplicativo

## Notas Importantes

- O aplicativo lê o arquivo `musicas.txt` que está incorporado no APK
- Todos os vídeos devem estar na pasta `karaoke` do pendrive
- Suporte apenas para vídeos `.mp4`
- Navegação via controle remoto da TV Box
- Tecla ➡️ (direita) para avançar para a próxima música

## Tecnologias Utilizadas

- React
- TypeScript
- Capacitor
- Tailwind CSS
