// ─────────────────────────────────────────────────────────────
//  1) Firebase web app config
//     Firebase console → Project settings → Your apps → Web app.
//     This config is public by design; protection comes from
//     Firebase Auth + firestore.rules (see README).
//
//     While apiKey still starts with "YOUR_", the game runs in
//     DEMO MODE: wishes are stored only in this browser.
// ─────────────────────────────────────────────────────────────
export const firebaseConfig = {
  apiKey: "AIzaSyBbCVWPCPdfhdEmoJt8rGN6BkYlUDYhLb8",
  authDomain: "her-wishlist-761c1.firebaseapp.com",
  projectId: "her-wishlist-761c1",
  storageBucket: "her-wishlist-761c1.firebasestorage.app",
  messagingSenderId: "211695732080",
  appId: "1:211695732080:web:58895bdad73e6fa9417bb5",
};

// ─────────────────────────────────────────────────────────────
//  2) Personal touches
// ─────────────────────────────────────────────────────────────
export const personal = {
  // Name shown on the dialog box tag (who is "speaking" to her).
  fromName: "Me ♡",

  // Texts below come in English (en), Português (pt) and Tiếng Việt (vi).
  // Other UI texts and the character's lines are in js/i18n.js.

  // Title on the intro screen.
  title: {
    en: "Little things I want to do with you in Vietnam",
    pt: "Pequenas coisas que eu quero fazer com você no Vietnã",
    vi: "Những điều nhỏ anh muốn làm cùng em ở Việt Nam",
  },

  // Intro message, one paragraph per entry (typed like a visual novel).
  intro: {
    en: [
      "Hey, love! ❤️",
      "I'm coming to Vietnam, and we're going to explore it together.",
      "Tell me the things you want us to do there. Places you want to see, food you want us to try, big things, little things, silly things, romantic things... anything you want.",
      "This is your little wishlist for our trip, just for us.",
    ],
    pt: [
      "Oi, amor! ❤️",
      "Eu tô indo pro Vietnã, e a gente vai explorar tudo juntos.",
      "Me conta o que você quer que a gente faça lá. Lugares que você quer ver, comidas que quer que a gente prove, coisas grandes, pequenas, bobas, românticas... tudo o que você quiser.",
      "Essa é a sua listinha de desejos da nossa viagem, só nossa.",
    ],
    vi: [
      "Chào em yêu! ❤️",
      "Anh sắp sang Việt Nam, và hai mình sẽ cùng nhau khám phá.",
      "Hãy kể anh nghe những điều em muốn hai mình làm ở đó. Những nơi em muốn đến, những món em muốn hai mình cùng thử, chuyện lớn, chuyện nhỏ, chuyện ngốc nghếch, chuyện lãng mạn... bất cứ điều gì em muốn.",
      "Đây là danh sách điều ước nhỏ của em cho chuyến đi, chỉ của riêng hai mình.",
    ],
  },

  // Heading above the wish field.
  wishTitle: {
    en: "What do you want us to do in Vietnam?",
    pt: "O que você quer que a gente faça no Vietnã?",
    vi: "Em muốn hai mình làm gì ở Việt Nam?",
  },

  // First line the character says on the wishlist screen.
  greeting: {
    en: "Hà Giang, Ninh Bình, Hội An… anywhere you want. I'm listening ♡",
    pt: "Hà Giang, Ninh Bình, Hội An… onde você quiser. Tô ouvindo ♡",
    vi: "Hà Giang, Ninh Bình, Hội An… em muốn đi đâu cũng được. Anh đang nghe đây ♡",
  },

  // "✨ More ideas" button (Gemini via Firebase AI Logic).
  ai: {
    enabled: true,
    model: "gemini-3.8-flash",
    places: ["Hà Giang", "Ninh Bình"],
    context: "He is travelling to Vietnam next month to meet her, and they will travel together, including Hà Giang (the Hà Giang Loop, Mã Pí Lèng Pass, Nho Quế River) and Ninh Bình (Tràng An, Tam Cốc, Hang Múa).",
    // Her wishes in these categories are never sent to Gemini.
    neverSendCategories: ["intimate"],
  },

  // Optional: put an .mp3 at this path to replace the built-in music box.
  // Leave null to use the generated soft melody.
  musicFile: null, // e.g. "assets/music.mp3"
};

// Single shared wishlist document id (must match firestore.rules).
export const WISHLIST_ID = "ours";

// Keep these ids in sync with validCategory() in firestore.rules.
export const CATEGORIES = [
  { id: "places",         emoji: "🏮", label: "Places to visit" },
  { id: "food",           emoji: "🍜", label: "Food to try" },
  { id: "adventures",     emoji: "🌎", label: "Adventures" },
  { id: "little_moments", emoji: "☕", label: "Little moments" },
  { id: "affection",      emoji: "💗", label: "Affection" },
  { id: "intimate",       emoji: "🔥", label: "Intimate wishes" },
  { id: "anything_else",  emoji: "✨", label: "Anything else" },
];

// Demo mode (wishes saved only in this browser): when the config above is still the
// placeholder, or on localhost with ?demo in the URL (handy to preview without signing in).
const forcedDemo = ["localhost", "127.0.0.1"].includes(location.hostname)
  && new URLSearchParams(location.search).has("demo");
export const isDemoMode = forcedDemo || firebaseConfig.apiKey.startsWith("YOUR_");
