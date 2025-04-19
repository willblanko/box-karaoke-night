
# Karaoke Box - Aplicativo para TV Box Android

Aplicativo de karaoke projetado especificamente para TV Box Android, com suporte a reprodução de vídeos de um pendrive USB.

## Requisitos Técnicos

- TV Box Android (versão 6.0 ou superior)
- Pendrive USB com pasta de vídeos de karaoke
- Resolução de tela: 720p ou 1080p

## Preparação do Pendrive USB

1. Crie uma pasta chamada `karaoke` na raiz do pendrive
2. Adicione arquivos de vídeo de karaoke no formato `.mp4`
3. Crie um arquivo `musicas.txt` na raiz do pendrive com os metadados das músicas

### Formato do arquivo `musicas.txt`

Exemplo de estrutura:
```
[1001]
Arquivo= 1001.mp4
Artista= Nome do Artista
Musica= Nome da Música
***
[1002]
Arquivo= 1002.mp4
Artista= Outro Artista
Musica= Título da Música
***
```

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
2. Transfira o APK para o dispositivo
3. Instale o aplicativo
4. Conecte o pendrive USB com os vídeos de karaoke

## Notas Importantes

- Todos os vídeos devem estar na pasta `karaoke` do pendrive
- Nomes de arquivo devem corresponder aos IDs no `musicas.txt`
- Suporte para vídeos `.mp4`
- Navegação via controle remoto da TV Box

## Tecnologias

- React
- TypeScript
- Capacitor
- Tailwind CSS
