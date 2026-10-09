// Data layer. Same interface for Firebase and for the local demo mode:
//
//   onAuth(cb)            cb(user | null)
//   signIn() / signOut()
//   subscribe(onItems, onError) -> unsubscribe
//        onItems(items, { fromCache })
//        item = { id, text, category, createdAt: Date|null, updatedAt: Date|null, pending }
//   subscribeMeta(cb)     cb({ updatedAt: Date|null })
//   add({ text, category })        -> { id, saved: Promise }
//   update(id, { text, category }) -> Promise
//   remove(id)                     -> Promise
//   restore(item)                  -> Promise   (undo a removal)
//
// Every returned Promise resolves only after the server confirmed the write.

import { firebaseConfig, isDemoMode, WISHLIST_ID } from "./config.js";

const SDK = "https://www.gstatic.com/firebasejs/13.0.0";

export async function createStore({ persistentCache = false } = {}) {
  return isDemoMode ? createDemoStore() : createFirebaseStore(persistentCache);
}

// ───────────────────────────── Firebase ─────────────────────────────

async function createFirebaseStore(persistentCache) {
  const [{ initializeApp }, authMod, fs] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-auth.js`),
    import(`${SDK}/firebase-firestore.js`),
  ]);
  const {
    getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut,
  } = authMod;
  const {
    initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
    memoryLocalCache, collection, doc, query, orderBy, onSnapshot, writeBatch,
    serverTimestamp, Timestamp,
  } = fs;

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  let localCache = memoryLocalCache();
  if (persistentCache) {
    try {
      localCache = persistentLocalCache({ tabManager: persistentMultipleTabManager() });
    } catch { /* private mode / no IndexedDB: fall back to memory */ }
  }
  const db = initializeFirestore(app, { localCache });

  const listRef = doc(db, "wishlists", WISHLIST_ID);
  const itemsCol = collection(listRef, "items");
  const touchList = (batch) => batch.set(listRef, { updatedAt: serverTimestamp() }, { merge: true });
  const toDate = (v) => (v && typeof v.toDate === "function" ? v.toDate() : null);

  return {
    mode: "firebase",

    onAuth: (cb) => onAuthStateChanged(auth, cb),

    signIn() {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      return signInWithPopup(auth, provider);
    },

    signOut: () => signOut(auth),

    subscribe(onItems, onError) {
      return onSnapshot(
        query(itemsCol, orderBy("createdAt", "asc")),
        { includeMetadataChanges: true },
        (snap) => {
          const items = snap.docs.map((d) => {
            const data = d.data({ serverTimestamps: "estimate" });
            return {
              id: d.id,
              text: data.text,
              category: data.category ?? null,
              createdAt: toDate(data.createdAt),
              updatedAt: toDate(data.updatedAt),
              pending: d.metadata.hasPendingWrites,
            };
          });
          onItems(items, { fromCache: snap.metadata.fromCache });
        },
        onError,
      );
    },

    subscribeMeta(cb) {
      return onSnapshot(listRef, (snap) => cb({ updatedAt: toDate(snap.data()?.updatedAt) }), () => {});
    },

    add({ text, category }) {
      const ref = doc(itemsCol);
      const batch = writeBatch(db);
      batch.set(ref, {
        text, category: category ?? null,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      touchList(batch);
      return { id: ref.id, saved: batch.commit() };
    },

    update(id, { text, category }) {
      const batch = writeBatch(db);
      batch.update(doc(itemsCol, id), { text, category: category ?? null, updatedAt: serverTimestamp() });
      touchList(batch);
      return batch.commit();
    },

    remove(id) {
      const batch = writeBatch(db);
      batch.delete(doc(itemsCol, id));
      touchList(batch);
      return batch.commit();
    },

    restore(item) {
      const batch = writeBatch(db);
      batch.set(doc(itemsCol, item.id), {
        text: item.text, category: item.category ?? null,
        createdAt: item.createdAt ? Timestamp.fromDate(item.createdAt) : serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      touchList(batch);
      return batch.commit();
    },
  };
}

// ───────────────────────────── Demo (localStorage) ─────────────────────────────

function createDemoStore() {
  const KEY = "hlw-demo-items";
  const AUTH_KEY = "hlw-demo-signed-in";
  const META_KEY = "hlw-demo-updated";
  const demoUser = { uid: "demo", displayName: "Demo", email: "demo@local" };
  const authListeners = new Set();
  const itemListeners = new Set();
  const metaListeners = new Set();
  const pending = new Set();

  const safeGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

  const read = () => {
    try { return JSON.parse(safeGet(KEY) || "[]"); } catch { return []; }
  };
  const write = (items) => {
    safeSet(KEY, JSON.stringify(items));
    safeSet(META_KEY, String(Date.now()));
  };
  const hydrate = (raw) => ({
    ...raw,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : null,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : null,
    pending: pending.has(raw.id),
  });
  const emit = () => {
    const items = read().map(hydrate).sort((a, b) => a.createdAt - b.createdAt);
    itemListeners.forEach((cb) => cb(items, { fromCache: false }));
    const ts = Number(safeGet(META_KEY));
    metaListeners.forEach((cb) => cb({ updatedAt: ts ? new Date(ts) : null }));
  };
  window.addEventListener("storage", (e) => { if (e.key === KEY) emit(); });

  // Simulates the network: applies the change, marks it pending, confirms later.
  // While offline the confirmation waits for the "online" event, like Firestore does.
  const commit = (id, mutate) => {
    write(mutate(read()));
    pending.add(id);
    emit();
    return new Promise((resolve) => {
      const confirm = () => setTimeout(() => { pending.delete(id); emit(); resolve(); }, 450);
      if (navigator.onLine) confirm();
      else window.addEventListener("online", confirm, { once: true });
    });
  };

  const isSignedIn = () => safeGet(AUTH_KEY) === "1";

  return {
    mode: "demo",

    onAuth(cb) {
      authListeners.add(cb);
      queueMicrotask(() => cb(isSignedIn() ? demoUser : null));
      return () => authListeners.delete(cb);
    },

    async signIn() {
      safeSet(AUTH_KEY, "1");
      authListeners.forEach((cb) => cb(demoUser));
    },

    async signOut() {
      safeSet(AUTH_KEY, "0");
      authListeners.forEach((cb) => cb(null));
    },

    subscribe(onItems) {
      itemListeners.add(onItems);
      setTimeout(emit, 300);
      return () => itemListeners.delete(onItems);
    },

    subscribeMeta(cb) {
      metaListeners.add(cb);
      return () => metaListeners.delete(cb);
    },

    add({ text, category }) {
      const id = "demo_" + Math.random().toString(36).slice(2, 10);
      const now = new Date().toISOString();
      const saved = commit(id, (items) => [...items, { id, text, category: category ?? null, createdAt: now, updatedAt: now }]);
      return { id, saved };
    },

    update(id, { text, category }) {
      return commit(id, (items) => items.map((it) =>
        it.id === id ? { ...it, text, category: category ?? null, updatedAt: new Date().toISOString() } : it));
    },

    remove(id) {
      return commit(id, (items) => items.filter((it) => it.id !== id));
    },

    restore(item) {
      return commit(item.id, (items) => [...items, {
        id: item.id, text: item.text, category: item.category ?? null,
        createdAt: (item.createdAt ?? new Date()).toISOString(),
        updatedAt: new Date().toISOString(),
      }]);
    },
  };
}
