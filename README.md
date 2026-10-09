# Her Little Wishlist ♡

Visual novel romântica em HTML/CSS/JS puro. Ela escreve os desejos, eles ficam salvos no
Firebase Cloud Firestore e você consulta tudo numa página privada.

```
index.html        → a experiência dela (intro, login, wishlist)
admin.html        → sua página privada (não é linkada em lugar nenhum)
js/config.js      → config do Firebase + textos personalizados   ← edite
firestore.rules   → regras de segurança                          ← edite os e-mails
assets/           → personagem (recortada das suas referências) e fundo
```

## Testar agora (modo demo)

Enquanto `js/config.js` tiver `apiKey: "YOUR_API_KEY"`, o jogo roda em **modo demo**: tudo é salvo
só no `localStorage` do navegador. Serve para ver o visual e o fluxo.

```bash
python3 -m http.server 8080
```

Abra `http://localhost:8080` (dela) e `http://localhost:8080/admin.html` (sua).
Precisa ser via servidor — abrir o arquivo direto (`file://`) não carrega módulos JS.

## Configurar o Firebase (≈10 min)

1. **Criar o projeto** em <https://console.firebase.google.com> (Analytics é opcional).
2. **Firestore**: *Build → Firestore Database → Create database* → modo **production**.
3. **Authentication**: *Build → Authentication → Get started → Sign-in method* → ative **Google**.
4. **Domínio autorizado**: *Authentication → Settings → Authorized domains* → adicione
   `SEU-USUARIO.github.io` (localhost já vem liberado).
5. **App web**: *Project settings → Your apps → `</>`* → copie o objeto `firebaseConfig` para
   `js/config.js`. Essa config é pública por natureza — quem protege os dados são as regras.
6. **Regras**: copie `firestore.rules.example` para `firestore.rules`, coloque os e-mails Google
   de vocês (**em minúsculas**) e cole em *Firestore → Rules → Publish*
   (ou `firebase deploy --only firestore:rules`). O `firestore.rules` com os e-mails reais fica
   fora do git, para eles não aparecerem no repositório público.

## Publicar no GitHub Pages

1. Crie um repositório (pode ser público — os desejos **não** ficam no repo, só no Firestore).
2. Envie esta pasta para a branch `main`.
3. *Settings → Pages → Deploy from a branch → `main` / root*.
4. Link dela: `https://SEU-USUARIO.github.io/REPO/` · Seu: `.../REPO/admin.html`.

> Se o repositório for público, as imagens da personagem também ficam públicas.
> Para manter tudo privado, use um repo privado (GitHub Pages em repo privado exige plano pago)
> ou hospede no Firebase Hosting.

## Personalizar

Em `js/config.js`:

- `personal.title` — título da abertura (hoje: a viagem pelo Vietnã).
- `CATEGORIES` — categorias (🏮 lugares, 🍜 comidas, aventuras, momentos, carinho, íntimos,
  outros). Se adicionar/remover alguma, atualize também `validCategory()` em `firestore.rules`.
- `personal.fromName` — nome na etiqueta da caixa de diálogo (quem "fala" com ela).
- `personal.intro` — a mensagem inicial, um parágrafo por item.
- `personal.musicFile` — coloque um `.mp3` em `assets/` e aponte aqui para trocar a caixinha de
  música gerada (use uma música que você tenha direito de usar).

### ✨ More ideas (Gemini)

O botão ✨ pede ao Gemini, pelo Firebase AI Logic, 6 sugestões novas no idioma selecionado. Os
desejos íntimos nunca são enviados (`neverSendCategories`). Se o Gemini falhar ou passar de 15 s,
a tela mostra as próximas sugestões fixas, sem erro. Modelo, lugares e contexto ficam em
`personal.ai` no `js/config.js`; `enabled: false` desliga o botão.

### Idiomas (English / Português / Tiếng Việt)

Ela troca o idioma no seletor **EN · PT · VI** no canto da tela. Na primeira visita, o idioma
vem do navegador dela, e a escolha fica salva.

- Textos da viagem (título, mensagem inicial, pergunta, primeira fala): `personal` em `js/config.js`.
- Botões, avisos, falas da personagem, nomes das categorias e sugestões: `js/i18n.js`.
- Em vietnamita, as falas usam **anh** (você) e **em** (ela).

Para ver a tela sem fazer login: `http://localhost:8080/?demo` (só funciona no localhost).

## Como funciona

- **Dados**: `wishlists/ours` (só `updatedAt`) + subcoleção `wishlists/ours/items/{id}` com
  `{ text, category, createdAt, updatedAt }`. Cada alteração é um *batch* atômico.
- **Salvamento automático**: adicionar, editar (Enter / sair do campo / "Done") e remover já
  gravam. Não existe botão de "concluir".
- **"Saved with love ♡"** só aparece quando a Promise do Firestore resolve — ou seja, quando o
  servidor confirmou. Offline, o item fica tracejado com *Not synced yet* e o cache persistente
  (IndexedDB) guarda a escrita até a internet voltar, mesmo se ela fechar a aba.
- **Erros** (ex.: permissão negada) mostram aviso, a personagem reage, e o texto volta para o
  campo para não se perder.
- **Remover** tem *Undo* por alguns segundos.
- **Admin**: lista, filtros por categoria, busca, contador, exportar/copiar em Markdown.
  O check de "planned" fica só no seu navegador — ela nunca vê.

## Segurança — resumo

- Sem login: **bloqueado**. Só os dois e-mails das regras, verificados pelo Google: ela lê e
  escreve; você só lê.
- Validação no servidor: texto 1–500 caracteres, categorias da lista, campos fixos, timestamps.
- Nenhuma senha ou chave privada no JavaScript. Esconder `admin.html` é só conveniência — a
  proteção real são as regras.

## Dica: link aberto pelo WhatsApp/Instagram

Navegadores internos desses apps bloqueiam o login do Google. O jogo detecta isso e mostra um
botão "Copy link" pedindo para abrir no Safari/Chrome. Mande o link sugerindo abrir no navegador.
