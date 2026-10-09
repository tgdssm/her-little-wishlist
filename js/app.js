import { personal, CATEGORIES, isDemoMode } from "./config.js";
import {
  LANGS, IDEAS, REACTION_FACES, t, getLang, setLang, getLocale,
  categoryLabel, reactionLines, personalText,
} from "./i18n.js";
import { createStore } from "./store.js";
import { createCharacter } from "./character.js";
import { createMusic } from "./music.js";
import { aiIdeasAvailable, generateIdeas } from "./ideas-ai.js";

const $ = (sel) => document.querySelector(sel);
const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

const IDEAS_SHOWN = 6;

const els = {
  intro: $("#intro"), introMessage: $("#intro-message"), startBtn: $("#start-btn"),
  signin: $("#signin"), googleBtn: $("#google-btn"), signinError: $("#signin-error"),
  inappHint: $("#inapp-hint"), copyLinkBtn: $("#copy-link-btn"),
  wishlist: $("#wishlist"), form: $("#wish-form"), input: $("#wish-input"),
  charCount: $("#char-count"), addBtn: $("#add-btn"), chips: $("#category-chips"),
  ideas: $("#ideas"), list: $("#wishes"), empty: $("#empty"), skeleton: $("#skeleton"),
  count: $("#count"), sync: $("#sync"), musicBtn: $("#music-btn"), signoutBtn: $("#signout-btn"),
  toast: $("#toast"), template: $("#wish-template"),
};

const character = createCharacter({
  stage: $("#stage"), face: $("#face"), portrait: $("#portrait"),
  dialog: $("#dialog"), dialogText: $("#dialog-text"),
});
$("#dialog-name").textContent = personal.fromName;
const music = createMusic();

let store = null;
let user = null;
let started = false;
let unsubscribe = null;
let items = [];
let loaded = false;
let selectedCategory = null;
let inflight = 0;
let lastMilestone = 0;
let introRun = 0;                 // bumps to cancel an intro being typed
let googleLabelKey = "google";
let syncKey = "syncLoading";
let idleTimer = null;
let toastTimer = null;
let aiIdeas = null;                // { lang, items } from Gemini, replaces the fixed suggestions
let aiLoading = false;
let staticOffset = 0;              // rotates the fixed suggestions when Gemini is unavailable
const rows = new Map();           // id -> <li>
const justSaved = new Set();      // ids confirmed in the last moments
const leaving = new Set();        // ids animating out

// ───────────────────────────── Boot ─────────────────────────────

init();

async function init() {
  if (isDemoMode) $("#demo-banner").hidden = false;
  renderLangSwitch();
  applyStaticTexts();
  renderChips(els.chips, () => selectedCategory, (id) => { selectedCategory = id; });
  renderIdeas();
  playIntro();

  try {
    store = await createStore({ persistentCache: true });
  } catch (err) {
    console.error(err);
    showSigninError(t("errLoad"));
    return;
  }

  store.onAuth((u) => {
    user = u;
    els.signoutBtn.hidden = !u;
    if (!started) return;
    if (u) enterGame();
    else leaveGame();
  });
}

async function playIntro() {
  const run = ++introRun;
  character.react("wink", t("sayHi"), { hold: 1800 });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let skip = reduced;
  els.startBtn.addEventListener("click", () => { skip = true; }, { once: true });
  els.introMessage.replaceChildren();

  for (const line of personalText("intro")) {
    if (run !== introRun) return;
    const p = document.createElement("p");
    els.introMessage.appendChild(p);
    if (skip) { p.textContent = line; continue; }
    p.classList.add("caret");
    for (let i = 1; i <= line.length && !skip; i++) {
      if (run !== introRun) return;
      p.textContent = line.slice(0, i);
      await wait(".!?…".includes(line[i - 1]) ? 260 : 26);
    }
    p.textContent = line;
    p.classList.remove("caret");
    if (!skip) await wait(380);
  }
  if (!started && run === introRun) character.react("happy", t("sayReady"), { hold: 0 });
}

// Shows the whole intro message at once (used after switching language).
function renderIntroInstant() {
  introRun++;
  els.introMessage.replaceChildren(...personalText("intro").map((line) => {
    const p = document.createElement("p");
    p.textContent = line;
    return p;
  }));
}

els.startBtn.addEventListener("click", () => {
  started = true;
  music.startIfAllowed();
  syncMusicBtn();
  els.startBtn.hidden = true;
  if (user) enterGame();
  else showSignin();
});

// ───────────────────────────── Sign in ─────────────────────────────

const isInAppBrowser = /FBAN|FBAV|Instagram|Line\/|WhatsApp|MicroMessenger|TikTok|Snapchat|; wv\)/i.test(navigator.userAgent);

function showSignin(message) {
  els.signin.hidden = false;
  els.inappHint.hidden = !isInAppBrowser;
  if (message) showSigninError(message);
  character.react("happy", t("sayOneStep"), { hold: 0 });
}

function showSigninError(message) {
  els.signinError.textContent = message;
  els.signinError.hidden = !message;
}

els.googleBtn.addEventListener("click", async () => {
  if (!store) return;
  showSigninError("");
  els.googleBtn.disabled = true;
  try {
    if (user) await store.signOut(); // switching accounts
    await store.signIn();
  } catch (err) {
    showSigninError(signinErrorMessage(err));
    if (err?.code !== "auth/popup-closed-by-user" && err?.code !== "auth/cancelled-popup-request") {
      character.react("confused", t("saySigninFail"), { hold: 0 });
    }
  } finally {
    els.googleBtn.disabled = false;
  }
});

function signinErrorMessage(err) {
  switch (err?.code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request": return "";
    case "auth/popup-blocked": return t("errPopupBlocked");
    case "auth/network-request-failed": return t("errNetwork");
    case "auth/unauthorized-domain": return t("errUnauthorizedDomain");
    case "auth/operation-not-allowed": return t("errOperationNotAllowed");
    default: return `${t("errSignin")} (${err?.code || err?.message || "unknown"}).`;
  }
}

els.copyLinkBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    els.copyLinkBtn.textContent = t("copied");
  } catch {
    els.copyLinkBtn.textContent = location.href;
  }
});

els.signoutBtn.addEventListener("click", () => store?.signOut());

// ───────────────────────────── Screens ─────────────────────────────

function enterGame() {
  if (document.body.dataset.screen === "game") return;
  document.body.dataset.screen = "game";
  els.intro.hidden = true;
  els.wishlist.hidden = false;
  loaded = false;
  els.skeleton.hidden = false;
  setSync("loading", "syncLoading");
  character.react("happy", personalText("greeting"), { hold: 0 });

  unsubscribe?.();
  unsubscribe = store.subscribe(onItems, onSubscribeError);
  scheduleIdleHint();
}

function leaveGame() {
  unsubscribe?.();
  unsubscribe = null;
  document.body.dataset.screen = "intro";
  els.wishlist.hidden = true;
  els.intro.hidden = false;
  els.startBtn.hidden = true;
  rows.forEach((li) => li.remove());
  rows.clear();
  items = [];
  showSignin();
}

function onSubscribeError(err) {
  console.error(err);
  if (err?.code === "permission-denied") {
    leaveGame();
    showSigninError(t("errDenied", user?.email ?? "?"));
    googleLabelKey = "googleSwitch";
    $("#google-label").textContent = t(googleLabelKey);
    character.react("confused", t("sayNotYou"), { hold: 0 });
  } else {
    setSync("error", "syncLoadError");
    character.react("confused", t("sayLoadError"), { hold: 0 });
  }
}

// ───────────────────────────── Rendering ─────────────────────────────

function onItems(next, { fromCache }) {
  items = next;
  if (!loaded && (!fromCache || items.length)) {
    loaded = true;
    els.skeleton.hidden = true;
  }
  if (!loaded) return;

  const ids = new Set(items.map((it) => it.id));
  for (const [id, li] of rows) {
    if (!ids.has(id) && !leaving.has(id)) animateOut(id, li);
  }
  let prev = null;
  for (const item of items) {
    let li = rows.get(item.id);
    if (!li) {
      li = createRow(item);
      rows.set(item.id, li);
    }
    if (!li.classList.contains("editing")) fillRow(li, item);
    const expectedNext = prev ? prev.nextElementSibling : els.list.firstElementChild;
    if (li !== expectedNext) els.list.insertBefore(li, expectedNext);
    prev = li;
  }

  const n = items.length;
  els.count.textContent = n ? t("count", n) : "";
  els.empty.hidden = n > 0;
  renderIdeas();

  if (inflight === 0) {
    if (!navigator.onLine || fromCache) {
      if (items.some((it) => it.pending)) setSync("offline", "syncOfflinePending");
      else if (!navigator.onLine) setSync("offline", "syncOfflineCopy");
    } else if (els.sync.dataset.state === "loading" || els.sync.dataset.state === "offline") {
      setSync("saved", "syncAllSaved");
    }
  }
}

function createRow(item) {
  const li = els.template.content.firstElementChild.cloneNode(true);
  li.dataset.id = item.id;
  applyStaticTexts(li);
  li.querySelector(".edit").addEventListener("click", () => startEdit(li));
  li.querySelector(".remove").addEventListener("click", () => removeWish(li.dataset.id));
  li.querySelector(".wish-text").addEventListener("dblclick", () => startEdit(li));
  return li;
}

function fillRow(li, item) {
  const cat = item.category ? catById[item.category] : null;
  li.querySelector(".wish-icon").textContent = cat ? cat.emoji : "♡";
  li.querySelector(".wish-text").textContent = item.text;
  li.querySelector(".wish-cat").textContent = cat ? categoryLabel(cat.id) : "";
  li.querySelector(".wish-cat").hidden = !cat;
  li.classList.toggle("pending", item.pending);

  const status = li.querySelector(".wish-status");
  status.className = "wish-status";
  if (item.pending && !navigator.onLine) {
    status.textContent = t("statusNotSynced");
    status.classList.add("offline");
  } else if (item.pending) {
    status.textContent = t("statusSaving");
    status.classList.add("saving");
  } else if (justSaved.has(item.id)) {
    status.textContent = t("statusSaved");
  } else {
    status.textContent = item.createdAt ? formatDate(item.createdAt) : "";
  }
}

function refreshRows() {
  for (const item of items) {
    const li = rows.get(item.id);
    if (li && !li.classList.contains("editing")) fillRow(li, item);
  }
}

function animateOut(id, li) {
  leaving.add(id);
  li.classList.add("leaving");
  const done = () => { li.remove(); rows.delete(id); leaving.delete(id); };
  li.addEventListener("animationend", done, { once: true });
  setTimeout(done, 600);
}

function renderChips(container, getSelected, setSelected) {
  container.querySelectorAll(".chip").forEach((c) => c.remove());
  for (const cat of CATEGORIES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.dataset.id = cat.id;
    const emoji = document.createElement("span");
    emoji.setAttribute("aria-hidden", "true");
    emoji.textContent = cat.emoji;
    b.append(emoji, ` ${categoryLabel(cat.id)}`);
    b.setAttribute("aria-pressed", String(getSelected() === cat.id));
    // Keep focus where it is (important for inline editing).
    b.addEventListener("mousedown", (e) => e.preventDefault());
    b.addEventListener("click", () => {
      setSelected(getSelected() === cat.id ? null : cat.id);
      container.querySelectorAll(".chip").forEach((c) =>
        c.setAttribute("aria-pressed", String(c.dataset.id === getSelected())));
    });
    container.appendChild(b);
  }
}

function setChipSelection(container, id) {
  container.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.id === id)));
}

function renderIdeas() {
  const existing = new Set(items.map((it) => it.text.trim().toLowerCase()));
  const lang = getLang();
  // Gemini ideas (if any, for this language) or the fixed ones. A fixed idea counts as
  // used if it was added in any language.
  const pool = aiIdeas?.lang === lang
    ? aiIdeas.items.map((i) => ({ ...i, all: [i.text] }))
    : rotate(IDEAS, staticOffset).map((i) => ({ emoji: i.emoji, category: i.category, text: i[lang], all: LANGS.map((l) => i[l.id]) }));
  const remaining = pool
    .filter((idea) => !idea.all.some((txt) => existing.has(txt.toLowerCase())))
    .slice(0, IDEAS_SHOWN);

  els.ideas.querySelectorAll(".idea").forEach((b) => b.remove());
  els.ideas.hidden = remaining.length === 0 && !aiIdeasAvailable;
  for (const idea of remaining) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "idea";
    b.textContent = `${idea.emoji} ${idea.text}`;
    b.addEventListener("click", () => {
      els.input.value = idea.text;
      selectedCategory = idea.category;
      setChipSelection(els.chips, selectedCategory);
      onInput();
      els.input.focus();
      character.react("surprised", t("sayIdeaPicked"));
    });
    els.ideas.appendChild(b);
  }

  if (aiIdeasAvailable) {
    const more = document.createElement("button");
    more.type = "button";
    more.className = "idea idea-more";
    more.textContent = aiLoading ? t("thinking") : t("moreIdeas");
    more.disabled = aiLoading;
    more.addEventListener("click", () => moreIdeas(remaining.map((i) => i.text)));
    els.ideas.appendChild(more);
  }
}

async function moreIdeas(shown) {
  if (aiLoading) return;
  aiLoading = true;
  renderIdeas();
  character.react("serious", t("sayThinking"), { hold: 0 });
  const lang = getLang();
  try {
    const list = await generateIdeas({ lang, items, avoid: shown });
    if (!list.length) throw new Error("empty response");
    aiIdeas = { lang, items: list };
    character.react("surprised", t("sayFreshIdeas"));
  } catch (err) {
    // Gemini busy/offline: quietly show the next fixed suggestions instead.
    console.warn("Gemini ideas unavailable, using fixed ones:", err);
    aiIdeas = null;
    staticOffset += IDEAS_SHOWN;
    character.react("wink", t("sayMoreStatic"));
  } finally {
    aiLoading = false;
    renderIdeas();
  }
}

// ───────────────────────────── Add / edit / remove ─────────────────────────────

function onInput() {
  const len = els.input.value.length;
  els.addBtn.disabled = els.input.value.trim().length === 0;
  els.charCount.hidden = len < 400;
  els.charCount.textContent = `${len}/500`;
  autoGrow(els.input);
}
els.input.addEventListener("input", onInput);
els.input.addEventListener("focus", () => {
  if (character.expression === "normal") character.react("happy", t("sayTellMe"));
});
els.input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    els.form.requestSubmit();
  }
});

els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = els.input.value.trim();
  if (!text || !store) return;
  const category = selectedCategory;

  const { id, saved } = store.add({ text, category });
  els.input.value = "";
  selectedCategory = null;
  setChipSelection(els.chips, null);
  onInput();

  const key = category ?? "none";
  const lines = reactionLines(key);
  const i = Math.floor(Math.random() * lines.length);
  character.react(REACTION_FACES[key][i] ?? "happy", lines[i]);
  scheduleIdleHint();

  track(saved, {
    onSaved() {
      markJustSaved(id);
      character.hearts();
      milestone();
    },
    onError() {
      // Give her text back so nothing is lost.
      if (!els.input.value) {
        els.input.value = text;
        selectedCategory = category;
        setChipSelection(els.chips, category);
        onInput();
      }
    },
  });
});

function startEdit(li) {
  if (li.classList.contains("editing")) return;
  const item = items.find((it) => it.id === li.dataset.id);
  if (!item) return;
  let category = item.category;
  li.classList.add("editing");

  const body = li.querySelector(".wish-body");
  const view = [...body.children];
  view.forEach((el) => { el.hidden = true; });

  const editor = document.createElement("div");
  editor.className = "wish-edit";
  editor.innerHTML = `
    <label class="sr-only" data-i18n="editWish"></label>
    <textarea maxlength="500" rows="2" enterkeyhint="done"></textarea>
    <fieldset class="chips"><legend class="sr-only" data-i18n="category"></legend></fieldset>
    <div class="wish-edit-row">
      <span class="wish-edit-hint" data-i18n="editHint"></span>
      <button type="button" class="btn btn-primary btn-small" data-i18n="done"></button>
    </div>`;
  applyStaticTexts(editor);
  body.appendChild(editor);
  const ta = editor.querySelector("textarea");
  const chips = editor.querySelector(".chips");
  const doneBtn = editor.querySelector("button");
  ta.value = item.text;
  renderChips(chips, () => category, (id) => { category = id; });
  doneBtn.addEventListener("mousedown", (e) => e.preventDefault());

  let finished = false;
  const finish = (save) => {
    if (finished) return;
    finished = true;
    const text = ta.value.trim();
    editor.remove();
    view.forEach((el) => { el.hidden = false; });
    li.classList.remove("editing");
    const latest = items.find((it) => it.id === li.dataset.id);
    if (latest) fillRow(li, latest);

    if (!save || !latest) return;
    if (!text) { toast(t("toastEmpty")); return; }
    if (text === latest.text && category === latest.category) return;

    fillRow(li, { ...latest, text, category, pending: true });
    track(store.update(latest.id, { text, category }), {
      onSaved() {
        markJustSaved(latest.id);
        li.classList.remove("flash"); void li.offsetWidth; li.classList.add("flash");
        character.react("happy", t("sayUpdated"));
      },
    });
  };

  ta.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); finish(true); }
    if (e.key === "Escape") { e.preventDefault(); finish(false); }
  });
  ta.addEventListener("input", () => autoGrow(ta));
  ta.addEventListener("blur", () => finish(true));
  doneBtn.addEventListener("click", () => finish(true));
  ta.focus();
  ta.setSelectionRange(ta.value.length, ta.value.length);
  autoGrow(ta);
}

function removeWish(id) {
  const item = items.find((it) => it.id === id);
  if (!item || !store) return;
  character.react("sad", t("sayRemoved"));
  track(store.remove(id), {
    onSaved() {
      toast(t("toastRemoved"), {
        action: t("undo"),
        onAction() {
          track(store.restore(item), { onSaved: () => markJustSaved(item.id) });
          character.react("laugh", t("sayBack"));
        },
      });
    },
  });
}

// ───────────────────────────── Sync status ─────────────────────────────

function setSync(state, key) {
  syncKey = key;
  els.sync.dataset.state = state;
  els.sync.querySelector(".sync-text").textContent = t(key);
}

function track(promise, { onSaved, onError } = {}) {
  inflight++;
  setSync(navigator.onLine ? "saving" : "offline", navigator.onLine ? "syncSaving" : "syncOfflinePending");
  const slow = setTimeout(() => {
    if (inflight > 0 && navigator.onLine) setSync("saving", "syncStillSaving");
  }, 8000);

  promise.then(
    () => {
      clearTimeout(slow);
      inflight--;
      if (inflight === 0) setSync("saved", "syncSavedWithLove");
      onSaved?.();
    },
    (err) => {
      clearTimeout(slow);
      inflight--;
      console.error(err);
      const key = err?.code === "permission-denied" ? "syncNotSavedPerm" : "syncNotSaved";
      setSync("error", key);
      toast(t(key), { error: true });
      character.react("confused", t("saySaveError"), { hold: 4000 });
      onError?.(err);
    },
  );
}

function markJustSaved(id) {
  justSaved.add(id);
  refreshRows();
  setTimeout(() => { justSaved.delete(id); refreshRows(); }, 2500);
}

window.addEventListener("offline", () => {
  if (document.body.dataset.screen !== "game") return;
  setSync("offline", inflight > 0 || items.some((it) => it.pending) ? "syncOfflinePending" : "syncOfflineLater");
  refreshRows();
  character.react("tired", t("sayOffline"), { hold: 4000 });
});
window.addEventListener("online", () => {
  if (document.body.dataset.screen !== "game") return;
  setSync(inflight > 0 ? "saving" : "saved", inflight > 0 ? "syncBackSyncing" : "syncBackOnline");
  refreshRows();
});

// ───────────────────────────── Little touches ─────────────────────────────

function milestone() {
  const n = items.length;
  const marks = [3, 5, 10, 15, 20, 30, 50];
  const hit = marks.filter((m) => n >= m).pop();
  if (hit && hit > lastMilestone) {
    lastMilestone = hit;
    if (n === hit) setTimeout(() => character.react("laugh", t("sayMilestone", hit), { hold: 3500 }), 2200);
  }
}

function scheduleIdleHint() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (document.body.dataset.screen !== "game" || document.activeElement === els.input) return;
    if (items.length === 0) character.react("wink", t("sayIdleEmpty"), { hold: 4000 });
    else character.react("happy", t("sayIdleMore"), { hold: 4000 });
  }, 35000);
}

function toast(text, { action, onAction, error = false } = {}) {
  clearTimeout(toastTimer);
  els.toast.hidden = false;
  els.toast.classList.toggle("error", error);
  els.toast.querySelector(".toast-text").textContent = text;
  const btn = els.toast.querySelector(".toast-action");
  btn.hidden = !action;
  btn.textContent = action ?? "";
  btn.onclick = () => { els.toast.hidden = true; onAction?.(); };
  toastTimer = setTimeout(() => { els.toast.hidden = true; }, action ? 6000 : 4000);
}

function syncMusicBtn() {
  els.musicBtn.setAttribute("aria-pressed", String(music.playing));
  els.musicBtn.title = t("music");
}
els.musicBtn.addEventListener("click", () => { music.toggle(); setTimeout(syncMusicBtn, 50); });

function autoGrow(ta) {
  ta.style.height = "auto";
  ta.style.height = `${Math.min(ta.scrollHeight + 2, 220)}px`;
}

function formatDate(d) {
  return d.toLocaleDateString(getLocale(), { month: "short", day: "numeric" });
}

// ───────────────────────────── Language ─────────────────────────────

// Fills every [data-i18n], [data-i18n-placeholder] and [data-i18n-title] under root.
function applyStaticTexts(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  root.querySelectorAll("[data-i18n-title]").forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  if (root !== document) return;
  $("#google-label").textContent = t(googleLabelKey);
  $("#intro-title-text").textContent = personalText("title");
  $("#wish-title").textContent = personalText("wishTitle");
  $("#lang-switch").setAttribute("aria-label", t("language"));
}

function renderLangSwitch() {
  const box = $("#lang-switch");
  box.replaceChildren(...LANGS.map((l) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = l.label;
    b.title = l.name;
    b.lang = l.id;
    b.setAttribute("aria-label", l.name);
    b.setAttribute("aria-pressed", String(l.id === getLang()));
    b.addEventListener("click", () => switchLang(l.id));
    return b;
  }));
}

function switchLang(id) {
  if (id === getLang()) return;
  setLang(id);
  renderLangSwitch();
  applyStaticTexts();
  renderChips(els.chips, () => selectedCategory, (c) => { selectedCategory = c; });
  renderIdeas();
  refreshRows();
  if (items.length) els.count.textContent = t("count", items.length);
  els.sync.querySelector(".sync-text").textContent = t(syncKey);
  if (document.body.dataset.screen === "intro") renderIntroInstant();
  character.react("wink", t("sayLang"), { hold: 2500 });
  // Gemini ideas are written in one language: ask again in the new one.
  if (aiIdeas && aiIdeas.lang !== id && document.body.dataset.screen === "game") moreIdeas([]);
}

function rotate(arr, n) {
  const k = n % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
