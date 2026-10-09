// Translations for her page (English, Português, Tiếng Việt).
// Vietnamese uses "anh" (him) / "em" (her): the dialog lines are him talking to her,
// and the wish suggestions are written from her point of view.
// Trip-specific texts (title, intro message…) live in config.js → personal.

import { personal } from "./config.js";

export const LANGS = [
  { id: "en", label: "EN", name: "English", locale: "en-US" },
  { id: "pt", label: "PT", name: "Português", locale: "pt-BR" },
  { id: "vi", label: "VI", name: "Tiếng Việt", locale: "vi-VN" },
];

const STRINGS = {
  en: {
    eyebrow: "just for you",
    start: "Let's start ♡",
    signinPrompt: "One tiny step first: sign in, so your wishes stay safe and only for us.",
    google: "Continue with Google",
    googleSwitch: "Use another Google account",
    inappHint: "It looks like this opened inside another app. Google sign-in works best in Safari or Chrome.",
    copyLink: "Copy link",
    copied: "Copied ♡ Now paste it in Safari or Chrome",
    placeholder: "Tell me something you want...",
    category: "Category",
    optional: "(optional)",
    add: "Add to my wishlist ♡",
    ideas: "Need ideas?",
    myList: "My wishlist",
    count: (n) => `${n} ${n === 1 ? "wish" : "wishes"}`,
    empty: "Nothing here yet… your first wish is waiting.",
    music: "Music",
    signout: "Sign out",
    language: "Language",
    editWish: "Edit wish",
    removeWish: "Remove wish",
    editHint: "Enter to save · Esc to cancel",
    done: "Done ♡",
    statusNotSynced: "Not synced yet",
    statusSaving: "Saving…",
    statusSaved: "Saved ♡",

    syncLoading: "Loading your wishlist…",
    syncAllSaved: "Everything is saved ♡",
    syncSavedWithLove: "Saved with love ♡",
    syncSaving: "Saving…",
    syncStillSaving: "Still saving… hang on ♡",
    syncOfflinePending: "Not synced yet — will save when you're back online",
    syncOfflineCopy: "Offline — showing your saved copy",
    syncOfflineLater: "Offline — new wishes will sync later",
    syncBackSyncing: "Back online — syncing…",
    syncBackOnline: "Back online ♡",
    syncLoadError: "Couldn't load your wishlist. Please refresh.",
    syncNotSavedPerm: "Not saved: this account doesn't have permission.",
    syncNotSaved: "Not saved — something went wrong. Please try again.",

    toastEmpty: "A wish can't be empty — use ✕ if you want to remove it.",
    toastRemoved: "Wish removed.",
    undo: "Undo",

    errPopupBlocked: "The sign-in window was blocked. Please allow pop-ups for this page and try again.",
    errNetwork: "No internet connection right now. Try again in a moment ♡",
    errUnauthorizedDomain: "This website isn't authorized in Firebase yet (Authentication → Settings → Authorized domains).",
    errOperationNotAllowed: "Google sign-in isn't enabled in Firebase yet (Authentication → Sign-in method).",
    errSignin: "Something went wrong signing in",
    errLoad: "Couldn't load. Please check your connection and refresh the page.",
    errDenied: (email) => `Hmm… this wishlist belongs to someone very special. You're signed in as ${email}.`,

    sayHi: "Hi you ♡",
    sayReady: "Whenever you're ready, tap “Let's start” ♡",
    sayOneStep: "Just one tiny step and we're in ♡",
    saySigninFail: "Hmm, that didn't work… let's try again?",
    sayNotYou: "Wait… are you sure that's you? 🤔",
    sayLoadError: "Something went wrong loading the list…",
    sayIdeaPicked: "Ooh, good one! Tap “Add” if you want it ♡",
    sayTellMe: "Tell me… ♡",
    sayUpdated: "Updated ♡",
    sayRemoved: "Aww, okay… I took it off the list.",
    sayBack: "Yay, it's back ♡",
    saySaveError: "Hmm… that didn't save. Can you try again?",
    sayOffline: "The internet fell asleep… I'll keep your wishes safe until it wakes up.",
    sayMilestone: (n) => `${n} wishes already! I'm going to make every one come true ♡`,
    sayIdleEmpty: "Psst… need ideas? Tap one of the little suggestions ♡",
    sayIdleMore: "Anything else your heart wants? ♡",
    sayLang: "English it is ♡",
    moreIdeas: "✨ More ideas",
    thinking: "✨ Thinking…",
    sayFreshIdeas: "Ooh, fresh ideas just for us ✨",
    sayThinking: "Hmm, let me think… ✨",
    sayMoreStatic: "Here are a few more ideas ♡",

    categories: {
      places: "Places to visit", food: "Food to try", adventures: "Adventures",
      little_moments: "Little moments", affection: "Affection",
      intimate: "Intimate wishes", anything_else: "Anything else",
    },
    reactions: {
      places: ["Adding it to our map! 🗺️", "I can already picture us there ♡"],
      food: ["Yes! I'm coming hungry 🍜", "You order, I'll try everything ♡"],
      adventures: ["An adventure! I'm already packing my bag ✈️", "Anywhere, as long as it's with you 🌎"],
      little_moments: ["The little moments are my favorite ☕", "Simple and perfect. Just like us."],
      affection: ["Come here… ♡", "You're making me blush over here 💗"],
      intimate: ["…oh. Noted. Very, very noted. 🙈", "Our little secret ♡"],
      anything_else: ["I love it. Keep them coming ✨", "Noted with a big smile ♡"],
      none: ["Ooh, I love that ♡", "Added! I can't wait for this one.", "That's going straight into my heart ♡"],
    },
  },

  pt: {
    eyebrow: "só pra você",
    start: "Vamos começar ♡",
    signinPrompt: "Só um passinho antes: entre com sua conta, pra seus desejos ficarem guardados só pra nós.",
    google: "Continuar com Google",
    googleSwitch: "Usar outra conta Google",
    inappHint: "Parece que isso abriu dentro de outro app. O login do Google funciona melhor no Safari ou no Chrome.",
    copyLink: "Copiar link",
    copied: "Copiado ♡ Agora cole no Safari ou no Chrome",
    placeholder: "Me conta algo que você quer...",
    category: "Categoria",
    optional: "(opcional)",
    add: "Adicionar à minha lista ♡",
    ideas: "Precisa de ideias?",
    myList: "Minha lista",
    count: (n) => `${n} ${n === 1 ? "desejo" : "desejos"}`,
    empty: "Nada aqui ainda… seu primeiro desejo está esperando.",
    music: "Música",
    signout: "Sair",
    language: "Idioma",
    editWish: "Editar desejo",
    removeWish: "Remover desejo",
    editHint: "Enter para salvar · Esc para cancelar",
    done: "Pronto ♡",
    statusNotSynced: "Ainda não sincronizado",
    statusSaving: "Salvando…",
    statusSaved: "Salvo ♡",

    syncLoading: "Carregando sua lista…",
    syncAllSaved: "Tudo salvo ♡",
    syncSavedWithLove: "Salvo com amor ♡",
    syncSaving: "Salvando…",
    syncStillSaving: "Ainda salvando… só um instante ♡",
    syncOfflinePending: "Ainda não sincronizado — vai salvar quando a internet voltar",
    syncOfflineCopy: "Sem internet — mostrando a cópia salva",
    syncOfflineLater: "Sem internet — os novos desejos vão sincronizar depois",
    syncBackSyncing: "Internet de volta — sincronizando…",
    syncBackOnline: "Internet de volta ♡",
    syncLoadError: "Não deu pra carregar sua lista. Atualize a página.",
    syncNotSavedPerm: "Não salvou: esta conta não tem permissão.",
    syncNotSaved: "Não salvou — algo deu errado. Tente de novo.",

    toastEmpty: "Um desejo não pode ficar vazio — use ✕ se quiser remover.",
    toastRemoved: "Desejo removido.",
    undo: "Desfazer",

    errPopupBlocked: "A janela de login foi bloqueada. Permita pop-ups nesta página e tente de novo.",
    errNetwork: "Sem conexão com a internet agora. Tente de novo daqui a pouco ♡",
    errSignin: "Algo deu errado no login",
    errLoad: "Não deu pra carregar. Confira a internet e atualize a página.",
    errDenied: (email) => `Hmm… esta lista é de alguém muito especial. Você entrou como ${email}.`,

    sayHi: "Oi, você ♡",
    sayReady: "Quando estiver pronta, toque em “Vamos começar” ♡",
    sayOneStep: "Só mais um passinho e a gente entra ♡",
    saySigninFail: "Hmm, não deu certo… vamos tentar de novo?",
    sayNotYou: "Peraí… tem certeza que é você? 🤔",
    sayLoadError: "Algo deu errado ao carregar a lista…",
    sayIdeaPicked: "Ooh, boa! Toque em “Adicionar” se quiser ♡",
    sayTellMe: "Me conta… ♡",
    sayUpdated: "Atualizado ♡",
    sayRemoved: "Own, tudo bem… tirei da lista.",
    sayBack: "Eba, voltou ♡",
    saySaveError: "Hmm… não salvou. Pode tentar de novo?",
    sayOffline: "A internet dormiu… vou guardar seus desejos até ela acordar.",
    sayMilestone: (n) => `Já são ${n} desejos! Vou realizar cada um ♡`,
    sayIdleEmpty: "Psiu… precisa de ideias? Toque numa das sugestões ♡",
    sayIdleMore: "Mais alguma coisa que seu coração quer? ♡",
    sayLang: "Português, então ♡",
    moreIdeas: "✨ Mais ideias",
    thinking: "✨ Pensando…",
    sayFreshIdeas: "Ooh, ideias novinhas só pra nós ✨",
    sayThinking: "Hmm, deixa eu pensar… ✨",
    sayMoreStatic: "Olha mais algumas ideias ♡",

    categories: {
      places: "Lugares pra visitar", food: "Comidas pra provar", adventures: "Aventuras",
      little_moments: "Pequenos momentos", affection: "Carinho",
      intimate: "Desejos íntimos", anything_else: "Qualquer outra coisa",
    },
    reactions: {
      places: ["Já tá no nosso mapa! 🗺️", "Já consigo imaginar a gente lá ♡"],
      food: ["Sim! Vou chegar com fome 🍜", "Você pede, eu provo tudo ♡"],
      adventures: ["Uma aventura! Já tô arrumando a mala ✈️", "Qualquer lugar, desde que seja com você 🌎"],
      little_moments: ["Os pequenos momentos são meus favoritos ☕", "Simples e perfeito. Igual a gente."],
      affection: ["Vem cá… ♡", "Assim você me deixa vermelho 💗"],
      intimate: ["…oh. Anotado. Muito, muito anotado. 🙈", "Nosso segredinho ♡"],
      anything_else: ["Amei. Pode mandar mais ✨", "Anotado com um sorrisão ♡"],
      none: ["Ooh, amei ♡", "Adicionado! Mal posso esperar por esse.", "Esse vai direto pro meu coração ♡"],
    },
  },

  vi: {
    eyebrow: "dành riêng cho em",
    start: "Bắt đầu nhé ♡",
    signinPrompt: "Một bước nhỏ thôi: đăng nhập để những điều ước của em được giữ an toàn, chỉ cho hai mình.",
    google: "Tiếp tục với Google",
    googleSwitch: "Dùng tài khoản Google khác",
    inappHint: "Có vẻ trang này đang mở trong một ứng dụng khác. Đăng nhập Google sẽ hoạt động tốt hơn trên Safari hoặc Chrome.",
    copyLink: "Sao chép liên kết",
    copied: "Đã sao chép ♡ Giờ em dán vào Safari hoặc Chrome nhé",
    placeholder: "Kể anh nghe điều em muốn...",
    category: "Danh mục",
    optional: "(không bắt buộc)",
    add: "Thêm vào danh sách của em ♡",
    ideas: "Cần gợi ý không?",
    myList: "Danh sách của em",
    count: (n) => `${n} điều ước`,
    empty: "Chưa có gì cả… điều ước đầu tiên của em đang chờ đó.",
    music: "Nhạc",
    signout: "Đăng xuất",
    language: "Ngôn ngữ",
    editWish: "Sửa điều ước",
    removeWish: "Xóa điều ước",
    editHint: "Enter để lưu · Esc để hủy",
    done: "Xong ♡",
    statusNotSynced: "Chưa đồng bộ",
    statusSaving: "Đang lưu…",
    statusSaved: "Đã lưu ♡",

    syncLoading: "Đang tải danh sách của em…",
    syncAllSaved: "Mọi thứ đã được lưu ♡",
    syncSavedWithLove: "Đã lưu bằng cả tình yêu ♡",
    syncSaving: "Đang lưu…",
    syncStillSaving: "Vẫn đang lưu… đợi chút nhé ♡",
    syncOfflinePending: "Chưa đồng bộ — sẽ lưu khi có mạng lại",
    syncOfflineCopy: "Mất mạng — đang hiện bản đã lưu",
    syncOfflineLater: "Mất mạng — điều ước mới sẽ được đồng bộ sau",
    syncBackSyncing: "Có mạng lại rồi — đang đồng bộ…",
    syncBackOnline: "Có mạng lại rồi ♡",
    syncLoadError: "Không tải được danh sách. Em tải lại trang nhé.",
    syncNotSavedPerm: "Chưa lưu được: tài khoản này không có quyền.",
    syncNotSaved: "Chưa lưu được — có lỗi xảy ra. Em thử lại nhé.",

    toastEmpty: "Điều ước không được để trống — bấm ✕ nếu em muốn xóa.",
    toastRemoved: "Đã xóa điều ước.",
    undo: "Hoàn tác",

    errPopupBlocked: "Cửa sổ đăng nhập bị chặn. Em cho phép cửa sổ bật lên (pop-up) cho trang này rồi thử lại nhé.",
    errNetwork: "Hiện không có kết nối mạng. Em thử lại sau một chút nhé ♡",
    errSignin: "Đăng nhập không thành công",
    errLoad: "Không tải được. Em kiểm tra kết nối mạng rồi tải lại trang nhé.",
    errDenied: (email) => `Hmm… danh sách này dành cho một người rất đặc biệt. Em đang đăng nhập bằng ${email}.`,

    sayHi: "Chào em ♡",
    sayReady: "Khi nào em sẵn sàng thì bấm “Bắt đầu nhé” ♡",
    sayOneStep: "Chỉ một bước nhỏ nữa thôi ♡",
    saySigninFail: "Hmm, chưa được rồi… mình thử lại nhé?",
    sayNotYou: "Khoan đã… em chắc đó là em không? 🤔",
    sayLoadError: "Có lỗi khi tải danh sách…",
    sayIdeaPicked: "Ồ, hay đó! Bấm “Thêm” nếu em thích nhé ♡",
    sayTellMe: "Kể anh nghe đi… ♡",
    sayUpdated: "Đã cập nhật ♡",
    sayRemoved: "Ồ, được rồi… anh đã xóa khỏi danh sách.",
    sayBack: "Yay, nó quay lại rồi ♡",
    saySaveError: "Hmm… chưa lưu được. Em thử lại giúp anh nhé?",
    sayOffline: "Mạng ngủ quên rồi… anh sẽ giữ điều ước của em cho đến khi nó tỉnh dậy.",
    sayMilestone: (n) => `Đã ${n} điều ước rồi! Anh sẽ biến từng điều thành sự thật ♡`,
    sayIdleEmpty: "Này… cần gợi ý không? Bấm vào một gợi ý nhỏ nhé ♡",
    sayIdleMore: "Trái tim em còn muốn gì nữa không? ♡",
    sayLang: "Tiếng Việt nhé ♡",
    moreIdeas: "✨ Thêm gợi ý",
    thinking: "✨ Đang nghĩ…",
    sayFreshIdeas: "Ồ, gợi ý mới toanh cho hai mình nè ✨",
    sayThinking: "Để anh nghĩ xem… ✨",
    sayMoreStatic: "Đây là vài gợi ý nữa nè ♡",

    categories: {
      places: "Địa điểm muốn đến", food: "Món muốn thử", adventures: "Phiêu lưu",
      little_moments: "Khoảnh khắc nhỏ", affection: "Âu yếm",
      intimate: "Điều ước riêng tư", anything_else: "Điều khác",
    },
    reactions: {
      places: ["Thêm vào bản đồ của hai mình rồi! 🗺️", "Anh đã tưởng tượng ra cảnh hai mình ở đó rồi ♡"],
      food: ["Tuyệt! Anh sẽ đến với cái bụng đói 🍜", "Em gọi món, anh ăn thử hết ♡"],
      adventures: ["Một chuyến phiêu lưu! Anh đang xếp vali rồi đây ✈️", "Đi đâu cũng được, miễn là đi cùng em 🌎"],
      little_moments: ["Những khoảnh khắc nhỏ là điều anh thích nhất ☕", "Đơn giản mà hoàn hảo. Giống như hai mình."],
      affection: ["Lại đây nào… ♡", "Em làm anh đỏ mặt rồi đó 💗"],
      intimate: ["…ồ. Anh ghi nhớ rồi. Nhớ rất, rất kỹ. 🙈", "Bí mật nhỏ của hai mình ♡"],
      anything_else: ["Anh thích lắm. Cứ kể tiếp đi em ✨", "Anh ghi lại với nụ cười thật tươi ♡"],
      none: ["Ồ, anh thích điều này ♡", "Đã thêm! Anh nóng lòng chờ điều này lắm.", "Điều này đi thẳng vào tim anh luôn ♡"],
    },
  },
};

// Which face goes with each reaction line (same order in every language).
export const REACTION_FACES = {
  places: ["laugh", "happy"],
  food: ["laugh", "happy"],
  adventures: ["laugh", "happy"],
  little_moments: ["happy", "laugh"],
  affection: ["kiss", "shy"],
  intimate: ["shy", "wink"],
  anything_else: ["laugh", "wink"],
  none: ["laugh", "happy", "wink"],
};

// Suggestions under the form (her point of view). Only a few show at a time.
export const IDEAS = [
  { emoji: "🏍️", category: "adventures", en: "Ride the Hà Giang Loop together", pt: "Fazer o Hà Giang Loop de moto juntos", vi: "Cùng nhau đi Hà Giang Loop bằng xe máy" },
  { emoji: "🚣", category: "places", en: "Take a boat ride through Tràng An in Ninh Bình", pt: "Passear de barquinho por Tràng An, em Ninh Bình", vi: "Đi thuyền ở Tràng An, Ninh Bình" },
  { emoji: "🤗", category: "affection", en: "Hug you for a long time at the airport", pt: "Te abraçar bem demorado no aeroporto", vi: "Ôm anh thật lâu ở sân bay" },
  { emoji: "⛰️", category: "places", en: "See the view from Mã Pí Lèng Pass", pt: "Ver a vista do passo Mã Pí Lèng", vi: "Ngắm cảnh từ đèo Mã Pí Lèng" },
  { emoji: "🍜", category: "food", en: "Eat phở together for breakfast", pt: "Tomar phở juntos no café da manhã", vi: "Cùng nhau ăn phở buổi sáng" },
  { emoji: "🌄", category: "places", en: "Climb Hang Múa and watch the sunset over Ninh Bình", pt: "Subir o Hang Múa e ver o pôr do sol sobre Ninh Bình", vi: "Leo Hang Múa ngắm hoàng hôn ở Ninh Bình" },
  { emoji: "💋", category: "affection", en: "Kiss you", pt: "Te beijar", vi: "Hôn anh" },
  { emoji: "🛶", category: "adventures", en: "Go on a boat on the Nho Quế River", pt: "Andar de barco no rio Nho Quế", vi: "Đi thuyền trên sông Nho Quế" },
  { emoji: "☕", category: "food", en: "Drink cà phê sữa đá together", pt: "Tomar cà phê sữa đá juntos", vi: "Cùng uống cà phê sữa đá" },
  { emoji: "🏮", category: "places", en: "Walk under the lanterns in Hội An", pt: "Caminhar sob as lanternas de Hội An", vi: "Dạo bước dưới những chiếc đèn lồng ở Hội An" },
  { emoji: "🥖", category: "food", en: "Try bánh mì from a street stall", pt: "Comer bánh mì de uma barraquinha de rua", vi: "Ăn bánh mì ở quán vỉa hè" },
  { emoji: "📸", category: "little_moments", en: "Take photos together in áo dài", pt: "Tirar fotos juntos de áo dài", vi: "Chụp ảnh cùng nhau với áo dài" },
  { emoji: "🌙", category: "intimate", en: "Spend a night together", pt: "Passar uma noite juntos", vi: "Qua đêm cùng nhau" },
  { emoji: "⛵", category: "places", en: "Sail around Hạ Long Bay", pt: "Navegar pela baía de Hạ Long", vi: "Du thuyền trên vịnh Hạ Long" },
  { emoji: "🌅", category: "little_moments", en: "Watch the sunset together", pt: "Ver o pôr do sol juntos", vi: "Cùng ngắm hoàng hôn" },
];

const PREF_KEY = "hlw-lang";
let current = detect();

function detect() {
  try {
    const saved = localStorage.getItem(PREF_KEY);
    if (STRINGS[saved]) return saved;
  } catch { /* ignore */ }
  const nav = (navigator.languages || [navigator.language || "en"]).map((l) => l.slice(0, 2).toLowerCase());
  return nav.find((l) => STRINGS[l]) ?? "en";
}

export const getLang = () => current;
export const getLocale = () => LANGS.find((l) => l.id === current).locale;

export function setLang(id) {
  if (!STRINGS[id]) return;
  current = id;
  try { localStorage.setItem(PREF_KEY, id); } catch { /* ignore */ }
  document.documentElement.lang = id;
}
document.documentElement.lang = current;

// t("key") or t("key", arg) for function entries. Falls back to English.
export function t(key, ...args) {
  const v = STRINGS[current][key] ?? STRINGS.en[key];
  return typeof v === "function" ? v(...args) : v;
}

export const categoryLabel = (id) => STRINGS[current].categories[id] ?? STRINGS.en.categories[id];
export const reactionLines = (cat) => STRINGS[current].reactions[cat];

// Trip-specific personal texts from config.js (per language, English fallback).
export function personalText(key) {
  const v = personal[key];
  if (v && typeof v === "object" && !Array.isArray(v)) return v[current] ?? v.en;
  return v;
}
