// Horse Reality Highlighter
// Foundation page: highlight horses by breed + coat + sex.
// Horse profile: "Save coat" button captures the horse's foal coat image.

const STORAGE_KEY = "HR_HIGHLIGHTER_SETTINGS";
const HORSE_IMG_HOST = "horse-img.horsereality.com";

const BREEDS = [
  "Akhal-Teke", "Appaloosa", "Arabian", "Brabant", "Brumby", "Camargue", "Cleveland Bay",
  "Exmoor Pony", "Finnhorse", "Fjord", "Friesian", "Haflinger", "Icelandic",
  "Irish Cob", "Kathiawari", "Kladruber", "Knabstrupper", "Lipizzaner", "Lusitano",
  "Mongolian", "Mustang", "Namib Desert", "Noriker", "Norman Cob", "Oldenburg",
  "Pantaneiro", "Pura Raza Española", "Quarter", "Shetland Pony", "Shire", "Suffolk Punch",
  "Thoroughbred", "Trakehner", "Welsh Pony"
];

// ----------------------------------------------------------------- settings

// settings.coats is an array of { id, url, name, horseUrl, enabled }.
//   id       filename of the coat image (used to match Foundation horses)
//   url      full link to the photo (also used for the thumbnail)
//   name     source horse name (display only)
//   horseUrl link back to the source horse profile
//   enabled  whether this coat is currently used for highlighting
let settings = { breed: "", sex: "both", coatFilter: true, dimNonMatching: false, coats: [] };

function filenameOf(url) {
  if (!url) return "";
  try { return new URL(url, location.href).pathname.split("/").pop() || ""; }
  catch { return url.split("/").pop().split("?")[0]; }
}

function thumbOf(url) {
  return url ? url.replace("/large/", "/small/") : "";
}

// Accepts either the legacy string form ("filename.png") or the object form.
function normalizeCoat(c) {
  if (typeof c === "string") {
    const id = filenameOf(c);
    return id ? { id, url: "", name: "", horseUrl: "", enabled: true } : null;
  }
  if (c && typeof c === "object") {
    const id = c.id || filenameOf(c.url || "");
    if (!id) return null;
    const coat = {
      id,
      url: c.url || "",
      name: c.name || "",
      horseUrl: c.horseUrl || "",
      enabled: c.enabled !== false,
    };
    if (Array.isArray(c.parts) && c.parts.length > 1) coat.parts = c.parts.slice();
    return coat;
  }
  return null;
}

function loadSettings() {
  const s = { breed: "", sex: "both", coatFilter: true, dimNonMatching: false, coats: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.breed === "string") s.breed = parsed.breed;
      if (["both", "mare", "stallion"].includes(parsed.sex)) s.sex = parsed.sex;
      if (typeof parsed.coatFilter === "boolean") s.coatFilter = parsed.coatFilter;
      if (typeof parsed.dimNonMatching === "boolean") s.dimNonMatching = parsed.dimNonMatching;
      if (Array.isArray(parsed.coats)) {
        const seen = new Set();
        for (const entry of parsed.coats) {
          const coat = normalizeCoat(entry);
          if (coat && !seen.has(coat.id)) { seen.add(coat.id); s.coats.push(coat); }
        }
      }
    }
  } catch (e) {
    console.error("[HR Highlighter] Failed to load settings:", e);
  }
  return s;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("[HR Highlighter] Failed to save settings:", e);
  }
  highlightHorses();
}

settings = loadSettings();

// --------------------------------------------------- Foundation highlighting

function enabledCoatIds() {
  return settings.coats.filter(c => c.enabled).map(c => c.id);
}

// Read a Foundation card's sex from its icon (sex-mare.png / sex-stallion.png).
function blockSex(block) {
  const icon = block.querySelector(".adopt_blocktitle img");
  const src = (icon?.getAttribute("src") || "").toLowerCase();
  const alt = (icon?.getAttribute("alt") || "").toLowerCase();
  if (src.includes("sex-mare") || alt === "mare") return "mare";
  if (src.includes("sex-stallion") || alt === "stallion") return "stallion";
  return "unknown";
}

// A card may carry one combined image (new system) or several stacked part
// images (old system), so match against every image in the card.
function cardImageSrcs(block) {
  return [...block.querySelectorAll(".miniature img, .adopt_blockimg img")]
    .map(i => i.getAttribute("src") || "")
    .filter(Boolean);
}

function highlightHorses() {
  const ids = enabledCoatIds();
  const results = [...document.querySelectorAll(".adopt_blocks")].map(block => {
    const breedText = block.querySelector(".adopt_blocktitle p")?.textContent || "";
    const srcs = cardImageSrcs(block);

    const breedOk = settings.breed ? breedText.includes(settings.breed) : true;
    const sexOk = settings.sex === "both" ? true : blockSex(block) === settings.sex;
    const coatOk = !settings.coatFilter ||
      (ids.length > 0 && ids.some(id => srcs.some(src => src.includes(id))));

    return { block, match: breedOk && sexOk && coatOk };
  });

  // Only dim when something actually matches, so a page with no matches at all
  // isn't greyed out entirely.
  const dimming = settings.dimNonMatching && results.some(r => r.match);

  results.forEach(({ block, match }) => {
    block.classList.toggle("hrh-highlight", match);
    block.classList.toggle("hrh-dim", dimming && !match);
  });
}

// --------------------------------------------------- foal coat extraction

// The new horse profile renders inside the <horsereality-horse> web component's
// (open) shadow root, so plain document.querySelector can't reach the image
// layers, the name, or the genetics. These helpers pierce open shadow roots.

// Collect every element matching `selector`, descending into open shadow roots.
function deepQueryAll(selector, root = document, out = [], seen = new Set()) {
  if (!root || seen.has(root)) return out;
  seen.add(root);
  try { out.push(...root.querySelectorAll(selector)); } catch (e) { /* ignore */ }
  let els = [];
  try { els = root.querySelectorAll("*"); } catch (e) { /* ignore */ }
  for (const el of els) {
    if (el.shadowRoot) deepQueryAll(selector, el.shadowRoot, out, seen);
  }
  return out;
}

function deepQuery(selector) {
  return deepQueryAll(selector)[0] || null;
}

// The main profile shadow root, searched first as a fast path before the
// (more expensive) full deep walk.
function horseRoot() {
  const host = document.querySelector("horsereality-horse");
  return (host && host.shadowRoot) ? host.shadowRoot : null;
}

function queryDeep(selector) {
  const root = horseRoot();
  const inRoot = root && root.querySelector(selector);
  if (inRoot) return inRoot;
  const inDoc = document.querySelector(selector);
  if (inDoc) return inDoc;
  return deepQuery(selector);
}

function queryDeepAll(selector) {
  const root = horseRoot();
  if (root) { const els = root.querySelectorAll(selector); if (els.length) return [...els]; }
  const els = document.querySelectorAll(selector);
  if (els.length) return [...els];
  return deepQueryAll(selector);
}

// Coat images come in two systems:
//   new: one combined image on horse-img.horsereality.com
//   old: separate body/mane/tail layers under /upload/colours/
function isHorsePartUrl(url) {
  return url.includes(HORSE_IMG_HOST) || url.includes("/upload/colours/");
}

// The "as a foal" image from the Colour tab. Adults have it; foals do not.
function readColourFoalUrl() {
  const img = queryDeep(".horse_foal_photo img.foal, .horse_foal_image img.foal");
  const src = img?.getAttribute("src") || img?.src || "";
  return isHorsePartUrl(src) ? src : "";
}

// Coat layers inside #profile-image, each with its url and on-screen position.
function profileLayers() {
  return queryDeepAll("hr-horse-image-layer")
    .map(l => ({
      url: l.getAttribute("url") || "",
      height: parseFloat(l.getAttribute("height")),
      left: parseFloat(l.getAttribute("left")),
      up: parseFloat(l.getAttribute("up")),
    }))
    .filter(l => isHorsePartUrl(l.url));
}

function sameSpot(a, b) {
  return Math.abs((a.height || 0) - (b.height || 0)) < 0.01
      && Math.abs((a.left   || 0) - (b.left   || 0)) < 0.01
      && Math.abs((a.up     || 0) - (b.up     || 0)) < 0.01;
}

// Distinct horses on the page (one per position). Old-system horses stack
// several part layers at one spot, so layer count != horse count.
function horseCount(layers) {
  const spots = [];
  for (const l of layers) if (!spots.some(s => sameSpot(s, l))) spots.push(l);
  return spots.length;
}

// All part URLs belonging to the foal (the smallest-height position). One URL
// for the new system; body/mane/tail for the old system.
function foalParts() {
  const layers = profileLayers();
  if (!layers.length) return [];
  const ref = [...layers].sort((a, b) => (a.height || 0) - (b.height || 0))[0];
  return layers.filter(l => sameSpot(l, ref)).map(l => l.url);
}

// Old-system foal assets live under /foals/; otherwise fall back to the age.
function looksLikeFoal(parts) {
  if (parts.some(u => u.includes("/foals/"))) return true;
  return (queryDeep("#age")?.textContent || "").toLowerCase().includes("month");
}

// The body layer is the coat's identity; mane/tail are extra parts.
function primaryPart(parts) {
  return parts.find(u => u.includes("/body/")) || parts[0] || "";
}

function colourTab() {
  return queryDeepAll("a, button, hr-tab, hr-int-button, li, span")
    .find(el => el.textContent.trim().toLowerCase() === "colour") || null;
}

function waitFor(fn, timeout = 2500, interval = 120) {
  return new Promise(resolve => {
    const start = Date.now();
    (function poll() {
      const value = fn();
      if (value) return resolve(value);
      if (Date.now() - start >= timeout) return resolve("");
      setTimeout(poll, interval);
    })();
  });
}

// Resolves to the foal's coat as a list of part URLs (one for the new system,
// body/mane/tail for the old system), or [] if nothing was found.
async function extractFoalCoat() {
  // 1. Colour-tab "as a foal" image (new-system adults), if already in the DOM.
  const colour = readColourFoalUrl();
  if (colour) return [colour];

  const layers = profileLayers();

  // 2. Foal shown with its dam: take the foal's part group directly.
  if (horseCount(layers) >= 2) return foalParts();

  // 3. Single horse already showing a foal image: use it.
  const parts = foalParts();
  if (parts.length && looksLikeFoal(parts)) return parts;

  // 4. Adult shown alone: open the Colour tab to load the "as a foal" image.
  const tab = colourTab();
  if (tab) {
    tab.click();
    const url = await waitFor(readColourFoalUrl, 2500);
    if (url) return [url];
  }

  // 5. Last resort: whatever the profile shows.
  return parts;
}

function horseName() {
  const el = queryDeep("#name") || queryDeep(".horse_title, .page_title, h1");
  const fromDom = el?.textContent?.replace(/\s+/g, " ").trim();
  if (fromDom) return fromDom;
  const fromTitle = (document.title || "").split(/[|\-–]/)[0].trim();
  return fromTitle || "";
}

function canonicalHorseUrl() {
  return location.origin + location.pathname;
}

// ----------------------------------------------------- draggable buttons

const CONFIG_POS_KEY = "HR_HIGHLIGHTER_CONFIG_POS";
const SAVE_POS_KEY = "HR_HIGHLIGHTER_SAVE_POS";

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function loadPos(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return (typeof p.top === "number" && typeof p.left === "number") ? p : null;
  } catch { return null; }
}
function savePos(key, pos) {
  try { localStorage.setItem(key, JSON.stringify(pos)); } catch (e) { /* ignore */ }
}
function clearPos(key) {
  try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
}

function applyPos(el, pos) {
  el.style.top = pos.top + "px";
  if (pos.left != null) { el.style.left = pos.left + "px"; el.style.right = "auto"; }
  else if (pos.right != null) { el.style.right = pos.right + "px"; el.style.left = "auto"; }
}

// Make a fixed-position button draggable like the sibling "HR color predictor"
// toolbar: drag to move (persisted), click still fires, right-click resets.
function makeDraggable(el, { storageKey, defaultPos }) {
  applyPos(el, loadPos(storageKey) || defaultPos);

  let dragging = false;
  let suppressClick = false;
  let startX = 0, startY = 0, originLeft = 0, originTop = 0;

  el.addEventListener("pointerdown", e => {
    if (e.button !== 0) return;
    el.setPointerCapture(e.pointerId);
    dragging = false;
    suppressClick = false;
    startX = e.clientX;
    startY = e.clientY;
    const r = el.getBoundingClientRect();
    originLeft = r.left;
    originTop = r.top;
  });

  el.addEventListener("pointermove", e => {
    if (!el.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!dragging && Math.hypot(dx, dy) >= 5) {
      dragging = true;
      suppressClick = true;
      el.classList.add("hrh-dragging");
    }
    if (dragging) {
      const top = clamp(originTop + dy, 0, window.innerHeight - el.offsetHeight);
      const left = clamp(originLeft + dx, 0, window.innerWidth - el.offsetWidth);
      el.style.top = top + "px";
      el.style.left = left + "px";
      el.style.right = "auto";
    }
  });

  el.addEventListener("pointerup", e => {
    if (!el.hasPointerCapture(e.pointerId)) return;
    el.releasePointerCapture(e.pointerId);
    el.classList.remove("hrh-dragging");
    if (dragging) {
      const r = el.getBoundingClientRect();
      savePos(storageKey, { top: r.top, left: r.left });
    }
  });

  // Swallow the click that ends a drag so it doesn't trigger the button action.
  el.addEventListener("click", e => {
    if (suppressClick) {
      e.preventDefault();
      e.stopImmediatePropagation();
      suppressClick = false;
    }
  }, true);

  // Right-click resets to the default position.
  el.addEventListener("contextmenu", e => {
    e.preventDefault();
    clearPos(storageKey);
    applyPos(el, defaultPos);
  });
}

// --------------------------------------------------------------- save button

function isHorseProfilePage() {
  return /^\/horses\/\d+/.test(location.pathname);
}

let saveBtnTimer = null;
function setSaveBtn(btn, state, label) {
  btn.dataset.state = state;
  btn.querySelector(".hrh-save-txt").textContent = label;
}
function resetSaveBtnLater(btn, delay = 1900) {
  clearTimeout(saveBtnTimer);
  saveBtnTimer = setTimeout(() => {
    btn.removeAttribute("data-state");
    btn.querySelector(".hrh-save-txt").textContent = "Save coat to Highlighter";
  }, delay);
}

async function onSaveCoat(e) {
  const btn = e.currentTarget;
  setSaveBtn(btn, "busy", "Reading coat…");

  const parts = await extractFoalCoat();
  const primary = primaryPart(parts);
  if (!primary) {
    setSaveBtn(btn, "error", "Coat not found");
    toast("err", "Could not read the foal coat", "Open the Colour tab, then try again");
    resetSaveBtnLater(btn);
    return;
  }

  const id = filenameOf(primary);
  const name = horseName();
  const extraParts = parts.length > 1 ? parts.slice() : undefined;
  const existing = settings.coats.find(c => c.id === id);

  if (existing) {
    existing.enabled = true;
    if (!existing.url) existing.url = primary;
    if (!existing.parts && extraParts) existing.parts = extraParts;
    if (!existing.name && name) existing.name = name;
    if (!existing.horseUrl) existing.horseUrl = canonicalHorseUrl();
    persist();
    refreshCoatList();
    setSaveBtn(btn, "exists", "Already saved");
    toast("info", "Coat already in your list", name || id, thumbOf(primary));
  } else {
    settings.coats.push({ id, url: primary, parts: extraParts, name, horseUrl: canonicalHorseUrl(), enabled: true });
    persist();
    refreshCoatList();
    setSaveBtn(btn, "saved", "Saved ✓");
    toast("ok", "Coat saved to Highlighter", name || id, thumbOf(primary));
  }
  resetSaveBtnLater(btn);
}

function injectSaveButton() {
  if (document.getElementById("hrh-save-btn")) return;

  const btn = document.createElement("button");
  btn.id = "hrh-save-btn";
  btn.type = "button";
  btn.title = "Save this horse's foal coat. Drag to move, right-click to reset position";
  btn.innerHTML = `<span class="hrh-save-ico">★</span><span class="hrh-save-txt">Save coat to Highlighter</span>`;
  btn.addEventListener("click", onSaveCoat);
  document.body.appendChild(btn);

  makeDraggable(btn, { storageKey: SAVE_POS_KEY, defaultPos: { top: 92, left: 10 } });
}

// ----------------------------------------------------------------- config UI

function applyBreed(value) { settings.breed = value; persist(); }
function applySex(value) { settings.sex = value; persist(); }
function applyCoatFilter(on) { settings.coatFilter = on; persist(); }
function applyDim(on) { settings.dimNonMatching = on; persist(); }

function removeCoat(id) {
  settings.coats = settings.coats.filter(c => c.id !== id);
  persist();
  refreshCoatList();
}

function toggleCoat(id, enabled) {
  const coat = settings.coats.find(c => c.id === id);
  if (coat) { coat.enabled = enabled; persist(); }
}

function addCoatManually(rawValue) {
  const id = filenameOf(rawValue.trim());
  if (!id) return false;
  if (settings.coats.some(c => c.id === id)) return false;
  const url = isHorsePartUrl(rawValue) ? rawValue.trim() : "";
  settings.coats.push({ id, url, name: "", horseUrl: "", enabled: true });
  persist();
  refreshCoatList();
  return true;
}

// Build the saved-coats list inside the given container.
function renderCoatList(container) {
  container.innerHTML = "";

  if (settings.coats.length === 0) {
    const empty = document.createElement("div");
    empty.className = "hrh-empty";
    empty.textContent = "No coats saved yet. Open a horse profile and click “Save coat to Highlighter”.";
    container.appendChild(empty);
    return;
  }

  for (const coat of settings.coats) {
    const row = document.createElement("div");
    row.className = "hrh-coat" + (coat.enabled ? "" : " disabled");

    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.className = "hrh-coat-toggle";
    toggle.checked = coat.enabled;
    toggle.title = "Enable / disable highlighting for this coat";
    toggle.addEventListener("change", () => {
      toggleCoat(coat.id, toggle.checked);
      row.classList.toggle("disabled", !toggle.checked);
    });

    const thumb = document.createElement("img");
    thumb.className = "hrh-coat-thumb";
    thumb.loading = "lazy";
    thumb.alt = "";
    if (coat.url) thumb.src = thumbOf(coat.url);

    const meta = document.createElement("div");
    meta.className = "hrh-coat-meta";

    const nameEl = document.createElement("div");
    nameEl.className = "hrh-coat-name";
    nameEl.textContent = coat.name || "Saved coat";

    const idEl = document.createElement("div");
    idEl.className = "hrh-coat-id";
    idEl.textContent = coat.id;
    idEl.title = coat.id;

    meta.appendChild(nameEl);
    meta.appendChild(idEl);

    const links = document.createElement("div");
    links.className = "hrh-coat-links";
    if (coat.url) {
      const photo = document.createElement("a");
      photo.href = coat.url;
      photo.target = "_blank";
      photo.rel = "noopener";
      photo.textContent = "photo ↗";
      links.appendChild(photo);
    }
    if (coat.horseUrl) {
      const horse = document.createElement("a");
      horse.href = coat.horseUrl;
      horse.target = "_blank";
      horse.rel = "noopener";
      horse.textContent = "horse ↗";
      links.appendChild(horse);
    }
    if (links.children.length) meta.appendChild(links);

    const del = document.createElement("button");
    del.className = "hrh-coat-del";
    del.type = "button";
    del.textContent = "×";
    del.title = "Remove this coat";
    del.addEventListener("click", () => removeCoat(coat.id));

    row.appendChild(toggle);
    row.appendChild(thumb);
    row.appendChild(meta);
    row.appendChild(del);
    container.appendChild(row);
  }
}

// Re-render the coat list if the panel is currently open.
function refreshCoatList() {
  const list = document.getElementById("hrh-coats");
  const count = document.getElementById("hrh-coats-count");
  if (list) renderCoatList(list);
  if (count) count.textContent = `${settings.coats.length} saved`;
}

function createConfigWindow() {
  if (document.getElementById("hrh-panel")) {
    document.getElementById("hrh-panel").remove();
    return;
  }

  const panel = document.createElement("div");
  panel.id = "hrh-panel";

  const breedOptions = ['<option value="">All Breeds</option>']
    .concat(BREEDS.map(b =>
      `<option value="${b}" ${settings.breed === b ? "selected" : ""}>${b}</option>`))
    .join("");

  panel.innerHTML = `
    <div id="hrh-panel-header">
      <h4>Highlighter Settings</h4>
      <button id="hrh-panel-close" type="button" title="Close">×</button>
    </div>
    <div id="hrh-panel-body">
      <div class="hrh-field">
        <label class="hrh-label" for="hrh-breed">Breed</label>
        <select id="hrh-breed" class="hrh-select">${breedOptions}</select>
      </div>

      <div class="hrh-field">
        <span class="hrh-label">Sex</span>
        <div class="hrh-seg" id="hrh-seg">
          <button type="button" data-sex="both">Both</button>
          <button type="button" data-sex="mare">♀ Mares</button>
          <button type="button" data-sex="stallion">♂ Stallions</button>
        </div>
      </div>

      <div class="hrh-field">
        <label class="hrh-check">
          <input type="checkbox" id="hrh-dim" />
          <span>Dim horses that don't match</span>
        </label>
        <span class="hrh-hint">Fades out cards that don't meet your filters (when at least one matches).</span>
      </div>

      <div class="hrh-field">
        <div class="hrh-coats-head">
          <span class="hrh-label">Saved Coats</span>
          <span><span id="hrh-coats-count" class="hrh-coats-count"></span>
          <button id="hrh-clear" class="hrh-clear" type="button">Clear all</button></span>
        </div>
        <label class="hrh-check">
          <input type="checkbox" id="hrh-coatfilter" />
          <span>Filter by coat</span>
        </label>
        <span class="hrh-hint">Off = highlight by breed + sex only, ignoring coats.</span>
        <div id="hrh-coats" class="hrh-coats"></div>
      </div>

      <div class="hrh-field">
        <label class="hrh-label" for="hrh-add-input">Add a coat ID manually</label>
        <div class="hrh-add">
          <input id="hrh-add-input" type="text" placeholder="image filename or URL" />
          <button id="hrh-add-btn" type="button">Add</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  // Breed
  const breedSel = panel.querySelector("#hrh-breed");
  breedSel.value = settings.breed;
  breedSel.addEventListener("change", () => applyBreed(breedSel.value));

  // Sex segmented control
  const seg = panel.querySelector("#hrh-seg");
  const syncSeg = () => seg.querySelectorAll("button").forEach(b =>
    b.classList.toggle("active", b.dataset.sex === settings.sex));
  seg.querySelectorAll("button").forEach(b =>
    b.addEventListener("click", () => { applySex(b.dataset.sex); syncSeg(); }));
  syncSeg();

  // Dim non-matching toggle
  const dimCb = panel.querySelector("#hrh-dim");
  dimCb.checked = settings.dimNonMatching;
  dimCb.addEventListener("change", () => applyDim(dimCb.checked));

  // Coats list
  refreshCoatList();

  // Coat filter toggle
  const coatFilterCb = panel.querySelector("#hrh-coatfilter");
  const coatsBox = panel.querySelector("#hrh-coats");
  const syncCoatFilter = () => {
    coatFilterCb.checked = settings.coatFilter;
    coatsBox.classList.toggle("ignored", !settings.coatFilter);
  };
  coatFilterCb.addEventListener("change", () => { applyCoatFilter(coatFilterCb.checked); syncCoatFilter(); });
  syncCoatFilter();

  // Clear all
  panel.querySelector("#hrh-clear").addEventListener("click", () => {
    if (settings.coats.length === 0) return;
    if (!confirm("Remove all saved coats?")) return;
    settings.coats = [];
    persist();
    refreshCoatList();
  });

  // Manual add
  const addInput = panel.querySelector("#hrh-add-input");
  const submitAdd = () => {
    if (addCoatManually(addInput.value)) addInput.value = "";
    else addInput.select();
  };
  panel.querySelector("#hrh-add-btn").addEventListener("click", submitAdd);
  addInput.addEventListener("keydown", e => { if (e.key === "Enter") submitAdd(); });

  // Close
  panel.querySelector("#hrh-panel-close").addEventListener("click", () => panel.remove());
}

function injectConfigButton() {
  if (document.getElementById("hrh-config-btn")) return;
  const btn = document.createElement("button");
  btn.id = "hrh-config-btn";
  btn.type = "button";
  btn.title = "Highlighter settings. Drag to move, right-click to reset position";
  // Text kept verbatim, the sibling "HR color predictor" anchors below it.
  btn.textContent = "Config Highlighter";
  btn.addEventListener("click", createConfigWindow);
  document.body.appendChild(btn);

  makeDraggable(btn, { storageKey: CONFIG_POS_KEY, defaultPos: { top: 10, right: 10 } });
}

// ----------------------------------------------------------------- toast

function toast(kind, title, sub, imgUrl) {
  let wrap = document.getElementById("hrh-toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "hrh-toast-wrap";
    document.body.appendChild(wrap);
  }

  const el = document.createElement("div");
  el.className = "hrh-toast " + kind;
  if (imgUrl) {
    const img = document.createElement("img");
    img.src = imgUrl;
    img.alt = "";
    el.appendChild(img);
  }
  const text = document.createElement("div");
  text.className = "hrh-toast-text";
  const t = document.createElement("div");
  t.className = "hrh-toast-title";
  t.textContent = title;
  text.appendChild(t);
  if (sub) {
    const s = document.createElement("div");
    s.className = "hrh-toast-sub";
    s.textContent = sub;
    s.title = sub;
    text.appendChild(s);
  }
  el.appendChild(text);
  wrap.appendChild(el);

  setTimeout(() => {
    el.style.transition = "opacity .25s";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 260);
  }, 3200);
}

// ----------------------------------------------------------------- init

injectConfigButton();
if (isHorseProfilePage()) injectSaveButton();
highlightHorses();

// Reality uses dynamic loading/tabs, so re-run highlighting periodically.
setInterval(highlightHorses, 2000);
