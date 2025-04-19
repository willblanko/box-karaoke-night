
# Karaoke Box - Aplicativo para TV Box Android

Um aplicativo de karaoke para TV Box Android com resolução adaptável para 720p e 1080p, que reproduz vídeos de um drive USB conectado.

## Funcionalidades

- Interface adaptada para TV Box Android (720p e 1080p)
- Entrada de número da música via controle remoto
- Reprodução de vídeos de karaoke do drive USB
- Sistema de fila para adicionar várias músicas
- Navegação por teclas direcionais (seta para direita avança música)
- Sistema de notas aleatórias com mensagens ao final de cada música
- Interface otimizada para controle remoto

## Como usar

1. Conecte um drive USB com vídeos de karaoke à sua TV Box Android
2. Inicie o aplicativo
3. Digite o número da música desejada
4. Use a tecla direcional direita para pular para a próxima música

## Requisitos técnicos

- TV Box Android com Android 6.0 ou superior
- Suporte a resoluções de 720p e 1080p
- Drive USB com vídeos de karaoke

## Observações importantes

- Os vídeos devem estar na raiz do drive USB
- Os nomes dos arquivos devem corresponder aos números das músicas (ex.: 1.mp4, 123.mp4)
- Recomenda-se manter um arquivo de índice no drive USB para facilitar a busca

## Desenvolvimento

Este projeto foi construído com:
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

Para uma implementação completa em TV Box Android, seria necessário:
1. Empacotar como aplicativo Android
2. Implementar APIs nativas para acesso ao sistema de arquivos
3. Configurar permissões para leitura de USB
4. Implementar detecção de dispositivos USB
