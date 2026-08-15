/* ------------------------------------------------------------------ *
 * vinyl — a hidden record player. `vinyl` at the prompt sets a
 * pixel-art turntable down on the desktop.
 *
 * Two homes, decided at open time (the command is desktop-first):
 *   · a wide tty desktop → it docks into the empty right half, beside
 *     the terminal, as furniture rather than a window;
 *   · anything smaller, or the GUI shell → a normal window, so it can
 *     be dragged, minimized and closed like everything else.
 *
 * The scene is drawn the same way the GUI wallpaper is: a low-res
 * canvas scaled up with smoothing off, so every edge is a real pixel
 * edge. The deck, the tonearm and the controls are hand-placed pixel
 * art; the record is built once into an offscreen canvas and blitted
 * rotated, which is what lets it actually spin without turning into a
 * smooth vector disc. Sheen wedges are baked INTO the record rather
 * than drawn over it — an overlay drawn after the rotation reads as
 * rectangles sliding across the disc, not as light.
 *
 * It ships with no music. The deck plays *your* records: drop audio
 * files onto it, or pick them, and they spin. Nothing is uploaded —
 * each file becomes an object URL this tab reads straight off your
 * disk, and the list dies with the window. That is the whole point of
 * building it this way: no library to license, no files to host, and
 * nobody's copyright to borrow.
 *
 * With nothing dropped on yet it loops the one bundled track, so the
 * deck is never dead on arrival — see BUILT_IN for its licence.
 * ------------------------------------------------------------------ */

import type { CommandContext } from "@/types";
import { prefersReducedMotion } from "@/core/fx";

interface Track {
  title: string;
  url: string;
  /**
   * True for a listener's file, whose object URL pins the file in memory
   * until revoked. The bundled track is a plain path and must not be.
   */
  local?: boolean;
  /** The house record, which steps aside once real records arrive. */
  builtIn?: boolean;
}

/** off → the stack plays through once; all → wraps; one → repeats a track. */
type Repeat = "off" | "all" | "one";

/**
 * The house record, played until someone brings their own. "Toybox" by
 * Lofium, from Pixabay, under the Pixabay Content Licence: free to use
 * including commercially, no attribution required — credited anyway in
 * the panel, because saying where music came from costs nothing.
 */
const BUILT_IN: Track = {
  title: "toybox · lofium",
  url: `${import.meta.env.BASE_URL}vinyl/lofium-toybox.mp3`,
  builtIn: true,
};

/**
 * A filename, as something worth reading on a tracklist. Leading track
 * numbers go, since the list numbers itself — but only when they look
 * like numbering ("01 ", "3 - ", "04."), never a bare single digit that
 * might be the title ("7 rings" keeps its 7).
 */
function prettify(name: string): string {
  return (
    name
      .replace(/\.[a-z0-9]+$/i, "") // drop the extension
      .replace(/^\s*(?:\d{2,3}[\s._-]+|\d{1,3}\s*[._\-)]\s*)/, "")
      .replace(/_+/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "untitled"
  );
}

/* ---- scene geometry, in scene pixels ------------------------------- */

const SCALE = 4; // css px per scene pixel
const SCENE_W = 88;
const SCENE_H = 104;

const DECK = { x: 3, y: 38, w: 82, h: 58 };
const PLATTER = { cx: 30, cy: 68, r: 23 };
const R = 21; // record radius
const LABEL_R = 7;
const DISC = R * 2 + 2; // offscreen edge

/* The tonearm pivots at the platter's top-right and swings the needle
   in along an arc, exactly like the real thing: the distance from the
   spindle falls as the arm rotates toward the deck. ARM_LEN is chosen
   so that a fully swung-in arm lands on the label and a parked one
   sits clear of the record. */
const PIVOT = { x: 60, y: 50 };
const ARM_LEN = 29;
const ARM_REST = 1.0; // parked, clear of the disc and left of the controls
const ARM_START = 0.7; // needle in the first groove
const ARM_END = 0.1; // run-out, beside the label

/** Below either of these the dock would crowd the terminal — window instead. */
const DOCK_MIN_W = 1024;
const DOCK_MIN_H = 560;

const C = {
  vinyl: "#131313",
  groove: "#1c1c1c",
  grooveAlt: "#141414",
  sheen: "#5e5e5e",
  sheenSoft: "#3a3a3a",
  rim: "#565656",
  label: "#57534e",
  labelRing: "#8a8580",
  labelInk: "#2a2724",
  spindle: "#0d0d0d",
  wood: "#191919",
  woodGrain: "#1f1f1f",
  woodEdge: "#3a3a3a",
  well: "#101010",
  metal: "#8f8f8f",
  metalLit: "#e2e2e2",
  metalDim: "#5a5a5a",
  star: "#d8d8d8",
  petal: "#cfcfcf",
  moon: "#e8e8e8",
  moonCrater: "#a4a4a4",
};

/**
 * The moon, lifted from the under-construction page (by way of the GUI
 * wallpaper) rather than invented again: a disc with a second disc
 * punched out of it, offset *diagonally*. That diagonal is the whole
 * trick — an offset straight along one axis gives a constant-width
 * sliver with straight sides, which is a banana. Two crater pixels and
 * a stippled halo are the only additions.
 */
const MOON_R = 8;
const MOON_GLOW = 5; // how far the halo reaches past the limb
/** Cutter offset, straight from the wallpaper's moon. */
const MOON_CUT = { x: 3.4, y: -1.6 };
/** Where the moon's own canvas sits in the scene. */
const MOON_AT = { x: 61, y: 2 };

/** 4×4 ordered dither, for gradients that stay pixels. */
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/* ------------------------------------------------------------------ */

interface Deck {
  el: HTMLElement;
  /**
   * Start the animation loop. Must be called *after* the element is in
   * the DOM: the loop treats a disconnected root as "my deck was closed"
   * and tears itself down, so starting it early kills the deck on frame
   * one — silently, since the first frame has already been drawn.
   */
  start(): void;
  destroy(): void;
}

function buildDeck(): Deck {
  const root = document.createElement("div");
  root.className = "vinyl";

  const stage = document.createElement("div");
  stage.className = "vinyl__stage";

  const canvas = document.createElement("canvas");
  canvas.className = "vinyl__canvas";
  canvas.width = SCENE_W;
  canvas.height = SCENE_H;
  // Width only: setting an inline height too would beat the stylesheet's
  // `height: auto` and squash the scene the moment max-width kicks in.
  canvas.style.width = `${SCENE_W * SCALE}px`;
  canvas.setAttribute("aria-hidden", "true");
  stage.append(canvas);

  const meta = document.createElement("div");
  meta.className = "vinyl__meta";
  // Both of these can outgrow the panel — a folder called "Lo-fi beats
  // to debug a window manager to", a track called anything at all — so
  // each is a clipping box around its own text, free to slide inside it.
  const title = document.createElement("strong");
  title.className = "vinyl__name";
  const titleText = document.createElement("span");
  titleText.textContent = "vinyl";
  title.append(titleText);
  const by = document.createElement("span");
  by.textContent = "33⅓ · your records";
  meta.append(title, by);

  const now = document.createElement("div");
  now.className = "vinyl__now";
  const nowText = document.createElement("span");
  now.append(nowText);

  // The bar is a real slider: the record is the fun way to seek, this
  // is the one that works from a keyboard.
  const bar = document.createElement("div");
  bar.className = "vinyl__bar";
  bar.tabIndex = 0;
  bar.setAttribute("role", "slider");
  bar.setAttribute("aria-label", "seek");
  bar.setAttribute("aria-valuemin", "0");
  const fill = document.createElement("i");
  bar.append(fill);

  const time = document.createElement("div");
  time.className = "vinyl__time";

  /* ---- transport ---------------------------------------------------- */

  const controls = document.createElement("div");
  controls.className = "vinyl__controls";
  const mkBtn = (label: string, glyph: string): HTMLButtonElement => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "vinyl__btn";
    b.textContent = glyph;
    b.setAttribute("aria-label", label);
    b.title = label;
    return b;
  };
  const shuffleBtn = mkBtn("shuffle", "⇄");
  const prevBtn = mkBtn("previous track", "|◀");
  const playBtn = mkBtn("play", "▶");
  const nextBtn = mkBtn("next track", "▶|");
  const repeatBtn = mkBtn("repeat", "↻");
  controls.append(shuffleBtn, prevBtn, playBtn, nextBtn, repeatBtn);

  const volRow = document.createElement("label");
  volRow.className = "vinyl__vol";
  const volLabel = document.createElement("span");
  volLabel.textContent = "vol";
  const vol = document.createElement("input");
  vol.type = "range";
  vol.min = "0";
  vol.max = "100";
  vol.value = "80";
  vol.setAttribute("aria-label", "volume");
  volRow.append(volLabel, vol);

  /* ---- track list --------------------------------------------------- */

  const list = document.createElement("ol");
  list.className = "vinyl__tracks";
  let rows: HTMLButtonElement[] = [];

  /* ---- loading records ---------------------------------------------- */

  // File inputs can't be styled, but their labels can — so each label
  // wears the button and the input hides behind it. Two of them: pick
  // individual records, or hand over a whole crate.
  const loadRow = document.createElement("div");
  loadRow.className = "vinyl__loadrow";

  const mkPicker = (text: string, folder: boolean): HTMLInputElement => {
    const label = document.createElement("label");
    label.className = "vinyl__load";
    label.tabIndex = 0;
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.className = "vinyl__file";
    if (folder) {
      // Non-standard, but it is what every browser actually implements
      // for directory picking, so it is set via attribute.
      input.setAttribute("webkitdirectory", "");
      input.setAttribute("directory", "");
    } else {
      input.accept = "audio/*";
    }
    label.append(input, document.createTextNode(text));
    // A label isn't a button, so the keyboard needs telling.
    label.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        input.click();
      }
    });
    loadRow.append(label);
    return input;
  };

  const pick = mkPicker("records…", false);
  const pickFolder = mkPicker("a whole folder…", true);

  const note = document.createElement("p");
  note.className = "vinyl__note";
  note.hidden = true;

  const credit = document.createElement("p");
  credit.className = "vinyl__credit";
  credit.textContent =
    "Drop files or a folder on the deck to play them. They are read straight off your disk by this tab — nothing is uploaded, nothing is stored, and the stack empties when you close the window. House record: “Toybox” by Lofium, free to use under the Pixabay Content Licence.";

  root.append(stage, meta, now, bar, time, controls, volRow, loadRow, list, note, credit);

  /* ---- playback ----------------------------------------------------- */

  const audio = new Audio();
  // Metadata, not "none": the needle can be dragged before anything is
  // played, and a scrub without a known duration has nothing to map to.
  audio.preload = "metadata";
  audio.volume = 0.8;
  let index = 0;
  let playing = false;

  /**
   * The stack on the deck. Index 0 is always the house record, so there
   * is something to play before anything is dropped on; the listener's
   * own records are appended after it.
   */
  const tracks: Track[] = [{ ...BUILT_IN }];
  const isBuiltIn = (i: number): boolean => tracks[i]?.builtIn === true;

  // "all" by default so the house record loops on its own, which is what
  // it did before there were buttons for any of this.
  let repeat: Repeat = "all";
  let shuffle = false;
  /**
   * Remaining picks for this shuffle pass. Drawing from a bag rather
   * than rolling a die means every record plays once before any plays
   * twice — which is what people actually mean by shuffle.
   */
  let bag: number[] = [];

  const refillBag = (exclude: number): void => {
    bag = tracks.map((_, i) => i);
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j]!, bag[i]!];
    }
    // Don't open a fresh pass with the record that just finished.
    if (bag.length > 1 && bag[0] === exclude) [bag[0], bag[1]] = [bag[1]!, bag[0]!];
  };

  /** The number shown against a track — the house record isn't numbered. */
  const displayNum = (i: number): string => {
    if (isBuiltIn(i)) return "··";
    let n = 0;
    for (let k = 0; k <= i; k++) if (!isBuiltIn(k)) n++;
    return String(n).padStart(2, "0");
  };

  /** Where "next" goes, honouring shuffle; null means stop. */
  const nextIndex = (): number | null => {
    if (tracks.length === 1) return repeat === "off" ? null : index;
    if (shuffle) {
      if (bag.length === 0) refillBag(index);
      const pick = bag.shift();
      return pick ?? null;
    }
    if (index + 1 < tracks.length) return index + 1;
    return repeat === "all" ? 0 : null;
  };

  /**
   * Slide a line of text back and forth inside its box, but only when it
   * genuinely doesn't fit. The shift and duration are measured from the
   * real overflow, so short names sit still and long ones travel at a
   * readable pace rather than a fixed one.
   */
  const marquee = (box: HTMLElement, inner: HTMLElement): void => {
    box.classList.remove("is-marquee");
    inner.style.removeProperty("--shift");
    if (prefersReducedMotion()) return;
    // Measured next frame: the text was only just written, and asking
    // now would measure the previous layout.
    requestAnimationFrame(() => {
      const shift = inner.scrollWidth - box.clientWidth;
      if (shift <= 2) return;
      inner.style.setProperty("--shift", `${shift}px`);
      inner.style.setProperty("--dur", `${Math.max(4, shift / 16)}s`);
      box.classList.add("is-marquee");
    });
  };

  /** The deck's own name — a loaded folder's, when there is one. */
  const setDeckName = (name: string): void => {
    titleText.textContent = name;
    marquee(title, titleText);
  };

  const fmt = (s: number): string => {
    if (!Number.isFinite(s)) return "--:--";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  /** Where the needle is being dragged to, 0–1, or null when it isn't. */
  let scrub: number | null = null;

  /** Playback position the UI should show — the drag wins while it lasts. */
  const shownTime = (): number => {
    const d = audio.duration;
    return scrub !== null && Number.isFinite(d) ? scrub * d : audio.currentTime;
  };

  /** Last line written to `now`, so the marquee only re-measures on change. */
  let shownLabel = "";

  const paint = (): void => {
    const t = tracks[index]!;
    const label = isBuiltIn(index) ? t.title : `${displayNum(index)} · ${t.title}`;
    // paint() runs on every timeupdate; re-measuring four times a second
    // would restart the slide forever.
    if (label !== shownLabel) {
      shownLabel = label;
      nowText.textContent = label;
      marquee(now, nowText);
    }
    playBtn.textContent = playing ? "❚❚" : "▶";
    playBtn.setAttribute("aria-label", playing ? "pause" : "play");
    rows.forEach((r, i) => r.classList.toggle("is-current", i === index));

    shuffleBtn.classList.toggle("is-active", shuffle);
    shuffleBtn.setAttribute("aria-pressed", String(shuffle));
    shuffleBtn.title = shuffle ? "shuffle: on" : "shuffle: off";
    // The mode is in the glyph as well as the highlight, so it doesn't
    // rely on colour alone to say which of the three it is.
    repeatBtn.textContent = repeat === "one" ? "↻1" : "↻";
    repeatBtn.classList.toggle("is-active", repeat !== "off");
    repeatBtn.title =
      repeat === "off" ? "repeat: off" : repeat === "all" ? "repeat: all" : "repeat: this track";
    repeatBtn.setAttribute("aria-label", repeatBtn.title);
    const d = audio.duration;
    const pos = shownTime();
    time.textContent = Number.isFinite(d) ? `${fmt(pos)} / ${fmt(d)}` : "";
    fill.style.width = Number.isFinite(d) && d > 0 ? `${Math.min(100, (pos / d) * 100)}%` : "0%";
    bar.setAttribute("aria-valuemax", Number.isFinite(d) ? String(Math.floor(d)) : "0");
    bar.setAttribute("aria-valuenow", String(Math.floor(pos)));
    bar.setAttribute("aria-valuetext", `${fmt(pos)} of ${fmt(d)}`);
  };

  function select(i: number, autoplay: boolean): void {
    index = (i + tracks.length) % tracks.length;
    // Repeating one track is the element's own job — with loop set,
    // "ended" never fires, so there is no gap to hear.
    audio.loop = repeat === "one";
    note.hidden = true;
    audio.src = tracks[index]!.url;
    // The element may be mid-error from a file that wouldn't decode, and
    // a new src alone doesn't always clear that: without this it reports
    // no duration, so the clock stays blank and the needle has nothing
    // to scrub against.
    audio.load();
    if (autoplay) void play();
    paint();
  }

  const play = async (): Promise<void> => {
    try {
      await audio.play();
    } catch {
      // Autoplay policy, or a file the browser won't decode; the error
      // handler covers the second, and there is nothing to throw here.
    }
  };

  audio.addEventListener("play", () => {
    playing = true;
    paint();
    tick();
  });
  audio.addEventListener("pause", () => {
    playing = false;
    paint();
  });
  audio.addEventListener("timeupdate", paint);
  audio.addEventListener("loadedmetadata", paint);
  audio.addEventListener("ended", () => {
    const next = nextIndex();
    if (next !== null) select(next, true);
  });

  audio.addEventListener("error", () => {
    playing = false;
    note.hidden = false;
    note.textContent = `couldn't play "${tracks[index]!.title}" — this browser may not decode that format.`;
    paint();
  });

  playBtn.addEventListener("click", () => {
    if (playing) audio.pause();
    else void play();
  });
  prevBtn.addEventListener("click", () => select(index - 1, playing));
  nextBtn.addEventListener("click", () => {
    // Pressing next always moves, even on repeat-one — that mode is
    // about what happens on its own, not about refusing to skip.
    const next = shuffle ? (nextIndex() ?? index + 1) : index + 1;
    select(next, playing);
  });
  shuffleBtn.addEventListener("click", () => {
    shuffle = !shuffle;
    if (shuffle) refillBag(index);
    paint();
  });
  repeatBtn.addEventListener("click", () => {
    repeat = repeat === "off" ? "all" : repeat === "all" ? "one" : "off";
    audio.loop = repeat === "one";
    paint();
  });
  vol.addEventListener("input", () => {
    audio.volume = Number(vol.value) / 100;
  });

  /* ---- the stack ----------------------------------------------------- */

  const renderList = (): void => {
    list.textContent = "";
    rows = tracks.map((t, i) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "vinyl__track";
      const num = document.createElement("span");
      num.className = "vinyl__num";
      num.textContent = displayNum(i);
      const name = document.createElement("span");
      name.className = "vinyl__title";
      name.textContent = t.title;
      btn.append(num, name);
      btn.addEventListener("click", () => select(i, true));
      li.append(btn);
      list.append(li);
      return btn;
    });
    paint();
  };

  /** Put records on the deck. The files never leave this tab. */
  const addFiles = (files: File[], collection?: string): void => {
    if (files.length === 0) return;
    // The house record is a placeholder, not part of anybody's playlist:
    // the first real record evicts it, so the stack is purely theirs.
    // Later drops append instead, since by then it is already gone.
    // Noted before the eviction — afterwards there is nothing left to ask.
    const onlyHouse = tracks.every((t) => t.builtIn);
    if (onlyHouse) tracks.length = 0;
    const first = tracks.length;
    // A folder arrives in whatever order the filesystem hands it over,
    // which is rarely the running order. Numeric-aware sort puts track 2
    // before track 10.
    const sorted = [...files].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }),
    );
    for (const file of sorted) {
      // Some browsers report an empty type for less common containers,
      // so an extension check backs up the MIME check.
      const looksAudio =
        file.type.startsWith("audio/") ||
        /\.(mp3|m4a|aac|ogg|oga|opus|wav|flac|weba)$/i.test(file.name);
      if (!looksAudio) continue;
      tracks.push({
        title: prettify(file.name),
        url: URL.createObjectURL(file),
        local: true,
      });
    }
    if (tracks.length === first) {
      note.hidden = false;
      note.textContent = "nothing playable in there — mp3, m4a, ogg, wav and flac all work.";
      return;
    }
    note.hidden = true;
    if (collection) setDeckName(collection);
    renderList();
    // The stack changed under it, so any half-drawn shuffle pass is
    // pointing at records that have moved.
    if (shuffle) refillBag(index);
    // Drop the needle on the first new record, unless one of their own
    // is already playing — then just add to the stack and say nothing.
    if (!playing || onlyHouse) select(first, true);
  };

  for (const input of [pick, pickFolder]) {
    input.addEventListener("change", () => {
      const files = Array.from(input.files ?? []);
      // A directory pick tags every file with its path, so the crate's
      // own name is the first segment of it.
      const folder = files[0]?.webkitRelativePath?.split("/")[0] || undefined;
      addFiles(files, folder);
      input.value = ""; // so the same records can be loaded again later
    });
  }

  /**
   * Everything audio in a drop, folders included. Dropped directories
   * only come through the entry API — `dataTransfer.files` lists the
   * folder itself and none of its contents.
   */
  const filesFromDrop = async (
    dt: DataTransfer,
  ): Promise<{ files: File[]; folder?: string }> => {
    // webkitGetAsEntry must be called before this handler yields, so the
    // entries are taken synchronously and walked afterwards.
    const entries = Array.from(dt.items ?? [])
      .map((item) => item.webkitGetAsEntry?.() ?? null)
      .filter((e): e is FileSystemEntry => e !== null);
    if (entries.length === 0) return { files: Array.from(dt.files ?? []) };

    // One folder in, and the deck takes its name. Several, and no single
    // name is the honest answer, so it keeps the one it has.
    const dirs = entries.filter((e) => e.isDirectory);
    const folder = dirs.length === 1 ? dirs[0]!.name : undefined;

    const out: File[] = [];
    const walk = async (entry: FileSystemEntry, depth: number): Promise<void> => {
      // Deep trees are someone's whole music library; stop somewhere.
      if (depth > 6) return;
      if (entry.isFile) {
        const file = await new Promise<File | null>((resolve) => {
          (entry as FileSystemFileEntry).file(resolve, () => resolve(null));
        });
        if (file) out.push(file);
        return;
      }
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      // readEntries hands back a batch at a time and signals the end
      // with an empty one, so it has to be called until it does.
      for (;;) {
        const batch = await new Promise<FileSystemEntry[]>((resolve) => {
          reader.readEntries(resolve, () => resolve([]));
        });
        if (batch.length === 0) break;
        for (const child of batch) await walk(child, depth + 1);
      }
    };
    for (const entry of entries) await walk(entry, 0);
    return { files: out, folder };
  };

  // Drag and drop anywhere on the deck.
  root.addEventListener("dragover", (e) => {
    e.preventDefault();
    root.classList.add("is-dropping");
  });
  root.addEventListener("dragleave", (e) => {
    // Children fire dragleave too; only the deck itself ends the state.
    if (e.target === root) root.classList.remove("is-dropping");
  });
  root.addEventListener("drop", (e) => {
    e.preventDefault();
    root.classList.remove("is-dropping");
    if (!e.dataTransfer) return;
    void filesFromDrop(e.dataTransfer).then(({ files, folder }) => addFiles(files, folder));
  });

  renderList();

  /* ---- seeking ------------------------------------------------------ *
   * Two ways in: drag the needle across the grooves (below, on the
   * canvas) or use the bar, which is a focusable slider so this is
   * reachable without a pointer at all.
   * -------------------------------------------------------------------*/

  const seekTo = (fraction: number): void => {
    const d = audio.duration;
    if (!Number.isFinite(d) || d <= 0) return;
    audio.currentTime = Math.max(0, Math.min(d - 0.05, fraction * d));
    paint();
  };

  const nudge = (seconds: number): void => {
    const d = audio.duration;
    if (!Number.isFinite(d) || d <= 0) return;
    seekTo((audio.currentTime + seconds) / d);
  };

  const barFraction = (clientX: number): number => {
    const r = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  };

  bar.addEventListener("pointerdown", (e) => {
    bar.setPointerCapture(e.pointerId);
    seekTo(barFraction(e.clientX));
  });
  bar.addEventListener("pointermove", (e) => {
    if (bar.hasPointerCapture(e.pointerId)) seekTo(barFraction(e.clientX));
  });
  bar.addEventListener("keydown", (e) => {
    const d = audio.duration;
    if (e.key === "ArrowRight") nudge(5);
    else if (e.key === "ArrowLeft") nudge(-5);
    else if (e.key === "Home") seekTo(0);
    else if (e.key === "End" && Number.isFinite(d)) seekTo(0.99);
    else if (e.key === " " || e.key === "Enter") {
      if (playing) audio.pause();
      else void play();
    } else return;
    e.preventDefault();
  });

  /* ---- dragging the needle ------------------------------------------ *
   * The record is the control. Grab anywhere on it and the needle
   * follows your distance from the spindle: the outer groove is the
   * start of the track, the label is the run-out — which is how the
   * position maps on the real thing, and why you can eyeball roughly
   * where you are in a song by looking at a record.
   * -------------------------------------------------------------------*/

  const toScene = (e: PointerEvent): { x: number; y: number } => {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * SCENE_W,
      y: ((e.clientY - r.top) / r.height) * SCENE_H,
    };
  };

  const radiusToFraction = (d: number): number =>
    Math.max(0, Math.min(1, (R - d) / (R - LABEL_R)));

  let lastSeek = 0;
  const onDrag = (e: PointerEvent): void => {
    const p = toScene(e);
    const d = Math.hypot(p.x - PLATTER.cx, p.y - PLATTER.cy);
    scrub = radiusToFraction(d);
    // Commit to the audio a few times a second while dragging, so you
    // hear the track move under the needle instead of only on release.
    const nowMs = performance.now();
    if (nowMs - lastSeek > 140) {
      lastSeek = nowMs;
      seekTo(scrub);
    }
    paint();
    if (reduce) draw();
  };

  // Tracked by id rather than by asking for pointer capture: capture is
  // an optimisation here, not the state. It can be refused or lost, and
  // the needle should not stick to the cursor when it is.
  let dragId: number | null = null;

  canvas.addEventListener("pointerdown", (e) => {
    const p = toScene(e);
    const d = Math.hypot(p.x - PLATTER.cx, p.y - PLATTER.cy);
    if (d > R + 2) return; // only the record is grabbable
    dragId = e.pointerId;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Some pointers can't be captured; dragging still works off the
      // id, it just stops early if the cursor leaves the canvas.
    }
    canvas.classList.add("is-scrubbing");
    e.preventDefault();
    onDrag(e);
  });
  // Move and release are watched on the window, not the canvas: a drag
  // that wanders off the record still tracks, and one that ends outside
  // it still ends. Removed again in destroy().
  const onWindowMove = (e: PointerEvent): void => {
    // A windowed deck is closed by the window chrome, which just drops
    // the element — destroy() never runs. The animation loop notices
    // that too, but not under reduced motion, where it never starts.
    // Safe here only because start() happens after the deck is mounted.
    if (!root.isConnected) return teardown();
    if (e.pointerId === dragId) onDrag(e);
  };
  const endDrag = (e: PointerEvent): void => {
    if (e.pointerId !== dragId) return;
    dragId = null;
    canvas.classList.remove("is-scrubbing");
    if (scrub !== null) seekTo(scrub);
    scrub = null;
    paint();
  };
  window.addEventListener("pointermove", onWindowMove);
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  /** Stop the deck: no audio, no frames, no stray window listeners. */
  function teardown(): void {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onWindowMove);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
    audio.pause();
  }

  /* ---- the scene ---------------------------------------------------- */

  const g = canvas.getContext("2d")!;
  g.imageSmoothingEnabled = false;
  const reduce = prefersReducedMotion();

  const px = (x: number, y: number, w: number, h: number, col: string): void => {
    g.fillStyle = col;
    g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  /* Record: built once, then only ever rotated. The label is a drawn
     ring, not the cover art — a 14px photograph reads as a smudge, and
     a smudge spinning at 33⅓ reads as a fault. The art lives on the
     sleeve, where there is room for it. */
  const disc = buildDisc();
  const moon = buildMoon();

  /* Sky: a seeded handful of stars and one crescent, so the deck sits
     in the same night the rest of this OS lives in. */
  const stars = Array.from({ length: 14 }, (_, i) => ({
    x: ((i * 37) % SCENE_W),
    y: (i * 11) % 32,
    ph: (i * 1.7) % (Math.PI * 2),
  }));

  /* Petals: small, slow, and few. Not blossom confetti — a couple of
     flecks drifting past, so the scene breathes. */
  const petals = Array.from({ length: 7 }, (_, i) => ({
    x: (i * 13 + 4) % SCENE_W,
    y: (i * 17) % SCENE_H,
    vy: 2.4 + (i % 3) * 0.9,
    ph: i * 1.3,
    a: 0.4 + (i % 4) * 0.12,
  }));

  let angle = 0;
  let armAngle = 0.95; // parked, until the first play swings it in
  let raf = 0;
  let last = 0;
  let clock = 0;

  const RPM = ((33 + 1 / 3) / 60) * Math.PI * 2;

  const draw = (): void => {
    g.clearRect(0, 0, SCENE_W, SCENE_H);

    // --- sky ---
    for (const s of stars) {
      const tw = reduce ? 0.7 : 0.45 + 0.45 * Math.sin(clock * 1.6 + s.ph);
      g.globalAlpha = tw;
      px(s.x, s.y, 1, 1, C.star);
    }
    g.globalAlpha = 1;
    g.drawImage(moon, MOON_AT.x, MOON_AT.y);

    // (The sleeve is a real <img> layered over this canvas — see above.)

    // --- deck cabinet ---
    px(DECK.x, DECK.y, DECK.w, DECK.h, C.wood);
    for (let x = DECK.x + 4; x < DECK.x + DECK.w - 3; x += 6) {
      px(x, DECK.y + 4, 1, DECK.h - 8, C.woodGrain);
    }
    // Outer case and an inset top panel, like the reference deck: two
    // frames rather than one, so it reads as a box and not a rectangle.
    strokeRect(DECK.x, DECK.y, DECK.w, DECK.h, C.woodEdge);
    strokeRect(DECK.x + 2, DECK.y + 2, DECK.w - 4, DECK.h - 4, C.well);
    // feet
    px(DECK.x + 8, DECK.y + DECK.h, 12, 3, C.metalDim);
    px(DECK.x + DECK.w - 20, DECK.y + DECK.h, 12, 3, C.metalDim);

    // Platter well: a recess the record sits down inside, with a lit rim
    // so the disc doesn't dissolve into the cabinet.
    fillCircle(PLATTER.cx, PLATTER.cy, PLATTER.r, C.well);
    ringCircle(PLATTER.cx, PLATTER.cy, PLATTER.r, C.woodEdge);

    // --- the record, rotating ---
    g.save();
    g.translate(PLATTER.cx, PLATTER.cy);
    g.rotate(angle);
    g.drawImage(disc, -DISC / 2, -DISC / 2);
    g.restore();

    // --- the control panel, in its own column clear of the arm ---
    knob(73, 54, playing ? clock * 1.1 : 0.6); // spins while the record does
    knob(73, 66, 2.1);
    px(67, 78, 14, 3, C.metalDim); // volume track
    px(67 + Math.round((audio.volume || 0) * 10), 76, 4, 7, C.metal);
    for (let i = 0; i < 3; i++) px(67, 85 + i * 2, 14, 1, C.woodGrain); // grille
    px(67, 91, 4, 2, playing ? C.metalLit : C.metalDim); // power lamp

    // The post the arm parks on, so a resting tonearm is resting on
    // something.
    px(56, 82, 6, 3, C.metalDim);

    // --- tonearm ---
    // The needle rides in along the arm's own arc: `armAngle` is an
    // offset from "pointing at the spindle", so 0 is the run-out and
    // bigger angles swing the head back off the record.
    const d = audio.duration;
    const progress =
      scrub ?? (Number.isFinite(d) && d > 0 ? audio.currentTime / d : 0);
    const engaged = scrub !== null || playing || audio.currentTime > 0;
    const target = engaged ? ARM_START + (ARM_END - ARM_START) * progress : ARM_REST;
    // Eased normally, but pinned while dragging — a needle that lags
    // behind the finger holding it feels broken rather than smooth.
    armAngle += (target - armAngle) * (reduce || scrub !== null ? 1 : 0.07);

    // Minus, not plus: the arm has to swing down across the deck. The
    // other way lifts it off the top of the cabinet entirely.
    const toSpindle = Math.atan2(PLATTER.cy - PIVOT.y, PLATTER.cx - PIVOT.x);
    const theta = toSpindle - armAngle;
    const tipX = PIVOT.x + Math.cos(theta) * ARM_LEN;
    const tipY = PIVOT.y + Math.sin(theta) * ARM_LEN;
    // counterweight, behind the pivot on the far side of the needle
    px(PIVOT.x - Math.cos(theta) * 7 - 2, PIVOT.y - Math.sin(theta) * 7 - 2, 5, 5, C.metalDim);
    pixelLine(tipX, tipY, PIVOT.x, PIVOT.y, 2, C.metal);
    px(PIVOT.x - 3, PIVOT.y - 3, 7, 7, C.metalDim);
    px(PIVOT.x - 1, PIVOT.y - 1, 3, 3, C.metalLit);
    px(tipX - 2, tipY - 2, 4, 4, C.metalLit); // headshell

    // --- petals, in front of everything ---
    for (const p of petals) {
      g.globalAlpha = p.a;
      const sway = reduce ? 0 : Math.sin(clock * 0.9 + p.ph) * 1.6;
      // Three pixels in a soft diagonal: enough to read as a petal
      // tumbling, far short of blossom confetti.
      px(p.x + sway, p.y, 2, 1, C.petal);
      px(p.x + sway + 1, p.y + 1, 1, 1, C.petal);
    }
    g.globalAlpha = 1;
  };

  function fillCircle(cx: number, cy: number, r: number, col: string): void {
    for (let y = -r; y <= r; y++) {
      const span = Math.floor(Math.sqrt(Math.max(0, r * r - y * y)));
      px(cx - span, cy + y, span * 2 + 1, 1, col);
    }
  }

  /** One-pixel outline of a circle — the platter rim. */
  function ringCircle(cx: number, cy: number, r: number, col: string): void {
    for (let a = 0; a < Math.PI * 2; a += 0.02) {
      px(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1, 1, col);
    }
  }

  function strokeRect(x: number, y: number, w: number, h: number, col: string): void {
    px(x, y, w, 1, col);
    px(x, y + h - 1, w, 1, col);
    px(x, y, 1, h, col);
    px(x + w - 1, y, 1, h, col);
  }

  function pixelLine(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    w: number,
    col: string,
  ): void {
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 0 : i / steps;
      px(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, w, w, col);
    }
  }

  /**
   * A knob: square, not round. A rasterized 3px circle at this scale
   * comes out a lopsided diamond — the reference deck's controls are
   * blocks for exactly this reason.
   */
  function knob(cx: number, cy: number, a: number): void {
    px(cx - 3, cy - 3, 7, 7, C.metalDim);
    px(cx - 2, cy - 2, 5, 5, C.metal);
    px(cx + Math.round(Math.cos(a) * 2), cy + Math.round(Math.sin(a) * 2), 1, 1, C.metalLit);
  }

  const tick = (): void => {
    cancelAnimationFrame(raf);
    // A window can be closed out from under a playing deck; nothing
    // else tells us, so the loop checks whether it is still on screen.
    if (!root.isConnected) {
      teardown();
      return;
    }
    const nowMs = performance.now();
    const dt = last ? Math.min(0.1, (nowMs - last) / 1000) : 0;
    last = nowMs;
    clock += dt;
    if (playing && !reduce) angle += RPM * dt;
    if (!reduce) {
      for (const p of petals) {
        p.y += p.vy * dt;
        if (p.y > SCENE_H) {
          p.y = -2;
          p.x = (p.x + 29) % SCENE_W;
        }
      }
    }
    draw();
    if (!reduce) raf = requestAnimationFrame(tick);
  };

  select(0, false); // the built-in loop, cued but not started
  draw();

  return {
    el: root,
    start() {
      // The scene drifts on its own — stars twinkle and petals fall
      // whether or not a record is spinning. Reduced motion keeps the
      // single frame already drawn above.
      if (!reduce) tick();
    },
    destroy() {
      teardown();
      audio.src = "";
      // Object URLs pin their file in memory until released, and the
      // stack is deliberately not persisted — closing the deck forgets
      // the records entirely. The bundled track is a plain path, so it
      // is left alone.
      for (const t of tracks) if (t.local) URL.revokeObjectURL(t.url);
      tracks.length = 0;
      root.remove();
    },
  };
}

/* ---- the record ---------------------------------------------------- */

/**
 * Paint the moon once, into its own canvas. Built offscreen because the
 * cut-out is done by erasing (`destination-out`), which would punch a
 * hole through the stars already drawn behind it on the main canvas.
 */
function buildMoon(): HTMLCanvasElement {
  const pad = MOON_R + MOON_GLOW;
  const size = pad * 2 + 1;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d")!;
  const mid = pad;

  // Halo first, so the moon lands on top of it. Ordered dithering keeps
  // it a scatter of pixels rather than a blur — a soft gradient would
  // survive the 4× upscale as visible grey banding.
  for (let y = -pad; y <= pad; y++) {
    for (let x = -pad; x <= pad; x++) {
      const d = Math.hypot(x, y);
      if (d <= MOON_R || d > MOON_R + MOON_GLOW) continue;
      // Nothing glows off the unlit side.
      const cdx = x - MOON_CUT.x;
      const cdy = y - MOON_CUT.y;
      if (cdx * cdx + cdy * cdy <= MOON_R * MOON_R) continue;
      const fall = 1 - (d - MOON_R) / MOON_GLOW;
      const thr = (BAYER[(y + 64) & 3]![(x + 64) & 3]! + 0.5) / 16;
      if (fall * fall <= thr) continue;
      g.fillStyle = `rgba(232, 232, 232, ${(0.12 + 0.3 * fall).toFixed(3)})`;
      g.fillRect(mid + x, mid + y, 1, 1);
    }
  }

  g.fillStyle = C.moon;
  g.beginPath();
  g.arc(mid, mid, MOON_R, 0, Math.PI * 2);
  g.fill();
  g.globalCompositeOperation = "destination-out";
  g.beginPath();
  g.arc(mid + MOON_CUT.x, mid + MOON_CUT.y, MOON_R, 0, Math.PI * 2);
  g.fill();
  g.globalCompositeOperation = "source-over";

  g.fillStyle = C.moonCrater;
  g.fillRect(mid - 4, mid + 2, 1, 1);
  g.fillRect(mid - 6, mid - 2, 1, 1);

  return c;
}

/** Paint the record once; the animation only ever rotates this image. */
function buildDisc(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = DISC;
  c.height = DISC;
  const g = c.getContext("2d")!;
  const mid = DISC / 2;

  for (let y = 0; y < DISC; y++) {
    for (let x = 0; x < DISC; x++) {
      const dx = x - mid + 0.5;
      const dy = y - mid + 0.5;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > R) continue;

      let col: string;
      if (d > R - 1) col = C.rim;
      else if (d < 1.5) col = C.spindle;
      else if (d < LABEL_R) {
        // One ring on a plain label: a filled mark at this size just
        // reads as an oversized spindle.
        col = Math.abs(d - LABEL_R * 0.62) < 0.6 ? C.labelRing : C.label;
      } else if (d < LABEL_R + 1) col = C.labelInk;
      else {
        // Gloss: two opposed lobes, dithered rather than cut at a hard
        // angle. A clean wedge boundary reads as a pie slice; ordered
        // dithering scatters the transition into pixels instead.
        const ang = Math.atan2(dy, dx);
        const lobe = 0.5 + 0.5 * Math.cos(2 * (ang - 0.6));
        const thr = (BAYER[y & 3]![x & 3]! + 0.5) / 16;
        const isLit = lobe > thr;
        const ring = Math.round(d) % 3 === 0;
        col = isLit ? (ring ? C.sheen : C.sheenSoft) : ring ? C.groove : C.grooveAlt;
      }
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  }

  return c;
}

/* ------------------------------------------------------------------ */

/** The docked deck, if one is currently out. */
let docked: Deck | null = null;

export function openVinyl(ctx: CommandContext): void {
  const app = document.getElementById("app");
  const wideEnough =
    !!app && app.clientWidth >= DOCK_MIN_W && app.clientHeight >= DOCK_MIN_H;
  const guiShell = document.body.classList.contains("mode-gui");

  // The GUI shell has its own furniture (icons, taskbar), so the deck
  // behaves like any other app there instead of floating over it.
  if (!wideEnough || guiShell) {
    const deck = buildDeck();
    deck.el.classList.add("vinyl--windowed");
    ctx.windows.open({
      id: "vinyl",
      title: "vinyl — 33⅓",
      content: deck.el,
      width: 396, // room for the scene at its exact 4× scale
      height: 560,
    });
    deck.start(); // only now is the element in the DOM
    ctx.terminal.print("drop a record on it. mind the dust.", "dim");
    return;
  }

  if (docked) {
    docked.destroy();
    docked = null;
    ctx.terminal.print("lifting the needle.", "dim");
    return;
  }

  const deck = buildDeck();
  deck.el.classList.add("vinyl--docked");

  const close = document.createElement("button");
  close.type = "button";
  close.className = "vinyl__close";
  close.textContent = "×";
  close.setAttribute("aria-label", "put the record away");
  close.addEventListener("click", () => {
    docked?.destroy();
    docked = null;
  });
  deck.el.append(close);

  app!.append(deck.el);
  deck.start();
  docked = deck;
  ctx.terminal.print("drop a record on it. mind the dust.", "dim");
  ctx.terminal.print("`vinyl` again puts it away.", "sub");
}
