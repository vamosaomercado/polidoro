# Polidoro - Limpeza de Piscinas

App (PWA) para quem faz limpeza de piscinas: rota do dia com Google Maps, cálculo de dosagens, estoque do carro, fotos de antes e depois, card e recibo pelo WhatsApp, mensalidades e painel do dia. Funciona sem internet e, com o Firebase configurado, faz login e sincroniza tudo na nuvem entre aparelhos.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | O app inteiro (arquivo único) |
| `instalar.html` | Página instaladora: reconhece Android, iPhone ou computador e mostra o jeito certo de instalar |
| `manifest.json` | Nome, cores, ícones e atalhos do app instalado |
| `sw.js` | Service worker: deixa o app funcionando sem internet |
| `icons/` | Ícones do app (192, 512, maskable, Apple e favicon) |
| `firestore.rules` | Regras de segurança do banco (colar no Firebase) |
| `.nojekyll` | Faz o GitHub Pages publicar os arquivos como estão |

## 1. Publicar no GitHub Pages

1. Crie um repositório novo (ex.: `polidoro`).
2. Envie **todos os arquivos desta pasta para a raiz** do repositório, mantendo a pasta `icons`.
3. Vá em **Settings → Pages → Build and deployment → Deploy from a branch → `main` → `/ (root)`** e salve.
4. Em 1 ou 2 minutos fica no ar:
   - App: `https://SEU-USUARIO.github.io/polidoro/`
   - Instaladora: `https://SEU-USUARIO.github.io/polidoro/instalar.html` ← este é o link para mandar ao cliente

## 2. Configurar o Firebase

Sem esta parte o app funciona normalmente, mas os dados ficam só no celular.

1. Em <https://console.firebase.google.com> clique em **Adicionar projeto** (ex.: `polidoro-piscinas`). O Google Analytics pode ficar desligado.
2. Na tela do projeto, clique no ícone **`</>`** (Web), dê um apelido (ex.: `Polidoro`) e registre. **Não** precisa marcar Firebase Hosting.
3. O Firebase mostra um bloco `const firebaseConfig = { ... }`. Abra o `index.html`, procure por **`CONFIGURAÇÃO DO FIREBASE`** (no começo do script) e troque os `COLE_AQUI` pelos valores do seu projeto:
   ```js
   const FIREBASE_CONFIG={
     apiKey:'AIza...',
     authDomain:'polidoro-piscinas.firebaseapp.com',
     projectId:'polidoro-piscinas',
     storageBucket:'polidoro-piscinas.firebasestorage.app',
     messagingSenderId:'1234567890',
     appId:'1:1234567890:web:abc123'
   };
   ```
4. **Authentication → Começar → Sign-in method**: ative **Google** e **E-mail/senha**.
5. **Authentication → Settings → Authorized domains → Add domain**: adicione `SEU-USUARIO.github.io`.
6. **Firestore Database → Criar banco de dados** → escolha a região `southamerica-east1 (São Paulo)` → modo **produção**.
7. **Firestore → Regras**: apague o que estiver lá, cole o conteúdo do arquivo `firestore.rules` e clique em **Publicar**.
8. Suba o `index.html` atualizado no GitHub.

Pronto: em **Ajustes → Conta e nuvem** aparece *Entrar com o Google* e *e-mail/senha*.

### Como a sincronização funciona

- Os dados de cada conta ficam em `contas/{id da conta}/…` no Firestore, separados por clientes, agenda de avulsos, visitas, estoque, movimentações, pagamentos, configurações e fotos. As regras só deixam cada conta ler e gravar o que é dela.
- O app grava primeiro no celular e depois manda para a nuvem. Sem internet, guarda a fila e envia quando a conexão voltar (o painel mostra "Salvo na nuvem" ou "Sem internet · N alterações aguardando").
- Em outro celular, é só entrar com a **mesma conta**: tudo é baixado e as mudanças passam de um aparelho para o outro em segundos.
- Se o celular já tinha dados antes de entrar numa conta que também tem dados, o app pergunta se quer **juntar os dois** ou **usar só os da nuvem**.
- As fotos vão comprimidas para o Firestore (sem precisar do Storage pago). Cada foto ocupa uns 150–400 KB; o plano gratuito tem 1 GB.
- O modo claro/escuro é de cada aparelho e não sincroniza.

## 3. Atualizar o app depois

Toda vez que mudar o `index.html`:

1. Suba o arquivo novo no GitHub.
2. Abra o `sw.js` e troque a versão da linha `const VERSAO = 'polidoro-v1.0.0';` (→ `v1.0.1`, `v1.0.2`…) e suba também.

Quem estiver com o app aberto vê o aviso **"Nova versão do Polidoro pronta — Atualizar"**.

## Atalhos do app instalado

Segurando o ícone do Polidoro na tela inicial (Android) aparecem atalhos para **Agenda**, **Calcular**, **Estoque** e **Financeiro**. Os links também funcionam direto: `./?abrir=hoje`, `./?abrir=calc`, `./?abrir=estoque`, `./?abrir=financeiro`.
