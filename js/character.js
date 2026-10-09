// The character on stage: face expressions, VN-style dialog and little hearts.

const EXPRESSIONS = [
  "normal", "happy", "sad", "angry", "surprised", "shy",
  "serious", "wink", "laugh", "kiss", "confused", "tired",
];
const BASE = "assets/character/";

export function createCharacter({ stage, face, portrait, dialogText, dialog }) {
  EXPRESSIONS.forEach((n) => { new Image().src = `${BASE}${n}.webp`; });

  let current = "normal";
  let revertTimer = null;
  let typing = null; // { finish() }

  function setFace(name) {
    if (!EXPRESSIONS.includes(name) || name === current) return;
    current = name;
    face.classList.remove("swap");
    void face.offsetWidth; // restart animation
    face.src = `${BASE}${name}.webp`;
    face.alt = `Her character looking ${name}`;
    face.classList.add("swap");
    portrait.classList.toggle("blush", name === "shy" || name === "kiss");
  }

  function type(text, speed = 24) {
    typing?.finish();
    dialog.classList.add("typing");
    return new Promise((resolve) => {
      let i = 0;
      let timer = null;
      const finish = () => {
        clearTimeout(timer);
        dialogText.textContent = text;
        dialog.classList.remove("typing");
        typing = null;
        resolve();
      };
      typing = { finish };
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return finish();
      const tick = () => {
        i++;
        dialogText.textContent = text.slice(0, i);
        if (i >= text.length) return finish();
        const ch = text[i - 1];
        timer = setTimeout(tick, ".!?…".includes(ch) ? speed * 8 : ch === "," ? speed * 4 : speed);
      };
      tick();
    });
  }

  dialog.addEventListener("click", () => typing?.finish());

  return {
    get expression() { return current; },

    // Show an expression (and optionally a line), then drift back to normal.
    react(expression, line, { hold = 2600 } = {}) {
      clearTimeout(revertTimer);
      setFace(expression);
      const done = line ? type(line) : Promise.resolve();
      if (hold > 0) {
        done.then(() => {
          clearTimeout(revertTimer);
          revertTimer = setTimeout(() => setFace("normal"), hold);
        });
      }
      return done;
    },

    say: type,
    skip: () => typing?.finish(),

    hearts(count = 6) {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = stage.getBoundingClientRect();
      for (let i = 0; i < count; i++) {
        const h = document.createElement("span");
        h.className = "float-heart";
        h.textContent = i % 3 === 0 ? "♡" : "♥";
        h.style.left = `${rect.width * (0.25 + Math.random() * 0.5)}px`;
        h.style.top = `${rect.height * (0.35 + Math.random() * 0.2)}px`;
        h.style.setProperty("--dx", `${(Math.random() - 0.5) * 90}px`);
        h.style.setProperty("--s", (0.7 + Math.random() * 0.8).toFixed(2));
        h.style.animationDelay = `${i * 90}ms`;
        stage.appendChild(h);
        h.addEventListener("animationend", () => h.remove());
      }
    },
  };
}
