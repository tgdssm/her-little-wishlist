// "✨ More ideas": asks Gemini (through Firebase AI Logic) for fresh wish suggestions.
// No API key in the code: requests go through the Firebase project.

import { firebaseConfig, personal, CATEGORIES } from "./config.js";

const SDK = "https://www.gstatic.com/firebasejs/13.0.0";
const LANG_NAMES = { en: "English", pt: "Brazilian Portuguese", vi: "Vietnamese" };

export const aiIdeasAvailable = Boolean(personal.ai?.enabled) && !firebaseConfig.apiKey.startsWith("YOUR_");

let modelPromise = null;

function getModel() {
  modelPromise ??= (async () => {
    const [{ initializeApp, getApps, getApp }, { getAI, getGenerativeModel, GoogleAIBackend, Schema }] =
      await Promise.all([import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-ai.js`)]);
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    return getGenerativeModel(ai, {
      model: personal.ai.model,
      generationConfig: {
        temperature: 1.1,
        responseMimeType: "application/json",
        responseSchema: Schema.array({
          items: Schema.object({
            properties: {
              emoji: Schema.string(),
              text: Schema.string(),
              category: Schema.enumString({ enum: CATEGORIES.map((c) => c.id) }),
            },
          }),
        }),
      },
    });
  })();
  modelPromise.catch(() => { modelPromise = null; });
  return modelPromise;
}

// items: her current wishes ({ text, category }); avoid: texts already on screen.
export async function generateIdeas({ lang, items, avoid, count = 6 }) {
  const model = await getModel();

  // Privacy: wishes in these categories are never sent to Gemini.
  const shared = items
    .filter((it) => !personal.ai.neverSendCategories.includes(it.category))
    .map((it) => `- ${it.text}`)
    .slice(-40);

  const prompt = `
You help a couple fill a romantic wishlist for a trip.
${personal.ai.context}

Write ${count} NEW wish ideas, from HER point of view, talking to him as "you".
Language: ${LANG_NAMES[lang]}.${lang === "vi" ? ` Use "anh" for him and "em" for her (e.g. "Ôm anh thật lâu").` : ""}
Rules:
- Short: at most 10 words each.
- Concrete and specific (real places, foods, experiences in ${personal.ai.places.join(", ")} and Vietnam in general), plus a couple of sweet, simple couple moments.
- Mix categories. Keep it tender and tasteful; nothing explicit.
- One fitting emoji per idea.
- Do not repeat or rephrase any of these:
${[...shared, ...avoid.map((t) => `- ${t}`)].join("\n") || "- (none yet)"}
`.trim();

  // The model sometimes answers "high demand" (500/503): retry a couple of times.
  let result;
  for (let attempt = 0; ; attempt++) {
    try {
      result = await withTimeout(model.generateContent(prompt), 15000);
      break;
    } catch (err) {
      const busy = /\b(500|503|429)\b|high demand|overloaded|unavailable/i.test(err?.message ?? "");
      if (!busy || attempt >= 2) throw err;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  const parsed = JSON.parse(result.response.text());
  const valid = new Set(CATEGORIES.map((c) => c.id));
  return parsed
    .filter((i) => i && typeof i.text === "string" && i.text.trim())
    .map((i) => ({
      emoji: Array.from(i.emoji || "✨").slice(0, 3).join(""),
      text: i.text.trim().slice(0, 140),
      category: valid.has(i.category) ? i.category : null,
    }))
    .slice(0, count);
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("timeout")), ms); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
