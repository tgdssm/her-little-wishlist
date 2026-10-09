import { CATEGORIES, isDemoMode } from "./config.js";
import { createStore } from "./store.js";

const $ = (sel) => document.querySelector(sel);
const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const PLANNED_KEY = "hlw-admin-planned";

const els = {
  signin: $("#admin-signin"), google: $("#admin-google"), error: $("#admin-error"),
  board: $("#admin-board"), count: $("#admin-count"), updated: $("#admin-updated"),
  filters: $("#admin-filters"), search: $("#admin-search"), hidePlanned: $("#hide-planned"),
  rows: $("#admin-rows"), empty: $("#admin-empty"),
  copy: $("#copy-btn"), download: $("#download-btn"), signout: $("#admin-signout"),
};

let store = null;
let items = [];
let filter = "all";
let unsub = [];
const planned = loadPlanned();

if (isDemoMode) $("#demo-banner").hidden = false;

try {
  store = await createStore();
} catch (err) {
  console.error(err);
  showError("Couldn't load Firebase. Check your connection.");
  els.signin.hidden = false;
}

store?.onAuth((user) => {
  unsub.forEach((fn) => fn());
  unsub = [];
  if (!user) {
    els.board.hidden = true;
    els.signin.hidden = false;
    return;
  }
  els.signin.hidden = true;
  els.board.hidden = false;
  unsub.push(store.subscribe((next) => { items = next; render(); }, onError));
  unsub.push(store.subscribeMeta(({ updatedAt }) => {
    els.updated.textContent = updatedAt ? `· last updated ${updatedAt.toLocaleString()}` : "";
  }));
});

function onError(err) {
  console.error(err);
  els.board.hidden = true;
  els.signin.hidden = false;
  showError(err?.code === "permission-denied"
    ? "This account doesn't have access. Check the admin email in firestore.rules."
    : `Couldn't load the wishlist (${err?.code ?? "error"}).`);
}

function showError(msg) {
  els.error.textContent = msg;
  els.error.hidden = !msg;
}

els.google.addEventListener("click", async () => {
  showError("");
  try { await store.signIn(); } catch (err) {
    if (err?.code !== "auth/popup-closed-by-user") showError(`Sign-in failed (${err?.code ?? err?.message}).`);
  }
});
els.signout.addEventListener("click", () => store.signOut());
els.search.addEventListener("input", render);
els.hidePlanned.addEventListener("change", render);

function render() {
  const n = items.length;
  els.count.textContent = `${n} ${n === 1 ? "desejo registrado" : "desejos registrados"}`;
  renderFilters();

  const q = els.search.value.trim().toLowerCase();
  const visible = items.filter((it) =>
    (filter === "all" || (it.category ?? "none") === filter) &&
    (!q || it.text.toLowerCase().includes(q)) &&
    !(els.hidePlanned.checked && planned.has(it.id)));

  els.rows.replaceChildren(...visible.map(row));
  els.empty.hidden = visible.length > 0;
}

function renderFilters() {
  const counts = { all: items.length, none: 0 };
  for (const it of items) counts[it.category ?? "none"] = (counts[it.category ?? "none"] ?? 0) + 1;
  const options = [
    { id: "all", label: "All" },
    ...CATEGORIES.map((c) => ({ id: c.id, label: `${c.emoji} ${c.label}` })),
    { id: "none", label: "♡ No category" },
  ];
  els.filters.replaceChildren(...options.map((o) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.setAttribute("aria-pressed", String(filter === o.id));
    b.textContent = o.label + " ";
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = counts[o.id] ?? 0;
    b.appendChild(n);
    b.addEventListener("click", () => { filter = o.id; render(); });
    return b;
  }));
}

function row(it) {
  const tr = document.createElement("tr");
  tr.classList.toggle("planned", planned.has(it.id));

  const check = document.createElement("td");
  check.className = "check-col";
  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = planned.has(it.id);
  box.setAttribute("aria-label", "Planned");
  box.addEventListener("change", () => {
    box.checked ? planned.add(it.id) : planned.delete(it.id);
    savePlanned();
    render();
  });
  check.appendChild(box);

  const cat = it.category ? catById[it.category] : null;
  tr.append(
    check,
    cell("wish-col", it.text),
    cell("cat-col", cat ? `${cat.emoji} ${cat.label}` : "—"),
    cell("date-col", it.createdAt ? it.createdAt.toLocaleDateString() : ""),
  );
  return tr;
}

function cell(cls, text) {
  const td = document.createElement("td");
  td.className = cls;
  td.textContent = text;
  return td;
}

function asMarkdown() {
  const lines = [`# Her Wishlist ❤️`, ``, `${items.length} desejos — exportado em ${new Date().toLocaleString()}`, ``];
  const groups = [...CATEGORIES.map((c) => ({ id: c.id, title: `${c.emoji} ${c.label}` })), { id: null, title: "♡ No category" }];
  for (const g of groups) {
    const list = items.filter((it) => (it.category ?? null) === g.id);
    if (!list.length) continue;
    lines.push(`## ${g.title}`, "");
    list.forEach((it) => lines.push(`- [${planned.has(it.id) ? "x" : " "}] ${it.text.replace(/\n/g, " ")}`));
    lines.push("");
  }
  return lines.join("\n");
}

els.copy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(asMarkdown());
    flash(els.copy, "Copied ♡");
  } catch {
    flash(els.copy, "Couldn't copy");
  }
});

els.download.addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([asMarkdown()], { type: "text/markdown" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "her-wishlist.md" });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

function flash(btn, text) {
  const old = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = old; }, 1600);
}

function loadPlanned() {
  try { return new Set(JSON.parse(localStorage.getItem(PLANNED_KEY) || "[]")); } catch { return new Set(); }
}
function savePlanned() {
  try { localStorage.setItem(PLANNED_KEY, JSON.stringify([...planned])); } catch { /* ignore */ }
}
