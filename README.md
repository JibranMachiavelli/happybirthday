# Um lugar feito para você

Experiência 3D de aniversário (Vite + React + React Three Fiber). Site 100% estático.

## 1. Instalar

```bash
npm install
```

## 2. Rodar

```bash
npm run dev
```

Para testar no celular na mesma rede, abra o endereço "Network" que aparece no terminal.

## 3. Nome e mensagens

Tudo fica em `src/config/birthday.ts`: nome, assinatura, textos da intro, dos 4 pontos (flor, estrela, livro, presente), da sequência final, da carta, cores e até as cores da personagem.

## 4. Música

Coloque o arquivo em `public/audio/background.mp3`. Toca em loop depois de clicar em "Entrar". Sem o arquivo, o site funciona normalmente (o final ainda toca uma caixinha de música sintetizada).

## 5. Personagem própria (GLB)

Coloque o modelo em `public/models/person.glb`. Se existir, substitui a personagem procedural automaticamente. A altura é normalizada e animações com nomes parecidos com `idle` e `walk`/`run` são usadas sozinhas.

## 6. Build

```bash
npm run build   # gera dist/
npm run preview # testa o build
```

## 7. Publicar no GitHub Pages (grátis)

Já existe o workflow `.github/workflows/deploy.yml`. Uma vez só: no repositório, **Settings → Pages → Source: GitHub Actions**. A partir daí, cada push na `main` publica em `https://<usuario>.github.io/<repo>/`.

## 8. Publicar na Vercel

```bash
npx vercel
```

Ou importe o repositório em vercel.com: framework **Vite**, build `npm run build`, output `dist`. Netlify e Cloudflare Pages usam as mesmas configurações.
