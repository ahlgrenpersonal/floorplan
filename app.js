const STORAGE_KEY = "floorplan-layout-v5";
const URL_LAYOUT_PARAM = "layout";
const URL_LAYOUT_VERSION = 1;
const SOURCE_PLAN_SIZE = 1000;
const PX_PER_FOOT = 19;

const WORLD = {
  widthFt: SOURCE_PLAN_SIZE / PX_PER_FOOT,
  depthFt: SOURCE_PLAN_SIZE / PX_PER_FOOT,
};

const presets = [
  { type: "king", name: "King bed", label: "King", widthIn: 76, depthIn: 80, color: "#83d6c8" },
  { type: "queen", name: "Queen bed", label: "Queen", widthIn: 60, depthIn: 80, color: "#f3c35f" },
  { type: "full", name: "Full bed", label: "Full", widthIn: 54, depthIn: 75, color: "#c7b7ff" },
  { type: "crib", name: "DaVinci crib", displayName: "Crib", label: "Crib", widthIn: 55, depthIn: 31, color: "#f1a7a6" },
  { type: "sofa", name: "RH Sofa", displayName: "Sofa", label: "Sofa", widthIn: 108, depthIn: 41.5, color: "#9ec5e6" },
  { type: "forma-coffee-table", name: "Forma coffee table", displayName: "Coffee Table", label: "Coffee\nTable", widthIn: 47, depthIn: 27.5, color: "#c8b58f" },
  { type: "viv-swivel-chair", name: "Viv swivel chair", displayName: "Swivel chair", label: "Chair", widthIn: 29.5, depthIn: 31, color: "#f0b6a6" },
  { type: "tv-stand", name: "TV stand", label: "TV", widthIn: 63, depthIn: 18, color: "#d9b48f" },
  { type: "nightstand-20-closed", name: "RH Bora 20\" closed nightstand", displayName: "20\" closed nightstand", label: "20\"", widthIn: 20, depthIn: 18, color: "#c5dea3" },
  { type: "nightstand-26", name: "RH Bora 26\" nightstand", displayName: "26\" nightstand", label: "26\"", widthIn: 26, depthIn: 18, color: "#b8d49a" },
  { type: "nightstand-38", name: "RH Bora 38\" nightstand", displayName: "38\" nightstand", label: "38\"", widthIn: 38, depthIn: 18, color: "#aacd8a" },
  { type: "dresser", name: "RH Bora Dresser", displayName: "Dresser", label: "Dresser", widthIn: 72, depthIn: 20, color: "#d1b37a" },
  { type: "cosmo-dresser-kids", name: "Cosmo Dresser (kids)", displayName: "Dresser (kids)", label: "Kids\nDresser", widthIn: 56, depthIn: 19, color: "#e1c27b" },
  { type: "cosmo-nightstand-kids", name: "Cosmo Nightstand (kids)", displayName: "Nightstand (kids)", label: "Kids\nNS", widthIn: 22.5, depthIn: 18, color: "#d8cf88" },
  { type: "dining-table-long", name: "Miles Dining Table (long)", displayName: "Dining Table (long)", label: "80\"", widthIn: 80, depthIn: 43, color: "#d6c28f" },
  { type: "dining-table-short", name: "Miles Dining Table (short)", displayName: "Dining Table (short)", label: "60\"", widthIn: 60, depthIn: 43, color: "#cdb87b" },
  { type: "cybex-stroller", name: "Cybex stroller", displayName: "Stroller", label: "Stroller", widthIn: 42.3, depthIn: 26, color: "#a7c7b8" },
  { type: "adult-scooter", name: "Adult scooter", label: "Scoot", widthIn: 35, depthIn: 21, color: "#a8b8d8" },
  { type: "micro-scooter", name: "Micro scooter", label: "Micro", widthIn: 23, depthIn: 10.75, color: "#b7a8d8" },
];

function imageRect(id, name, x, y, width, height, label = "") {
  return {
    id,
    name,
    x: x / PX_PER_FOOT,
    y: y / PX_PER_FOOT,
    widthFt: width / PX_PER_FOOT,
    depthFt: height / PX_PER_FOOT,
    label,
  };
}

const exactRooms = [
  imageRect("master", "Master suite", 122, 43, 230, 312, "16'0\" x 12'6\""),
  imageRect("office", "Office/media", 510, 43, 245, 235, "15'7\" x 14'2\""),
  imageRect("living", "Living", 122, 318, 328, 330, "30'0\" x 16'2\""),
  imageRect("kitchen", "Kitchen", 414, 432, 158, 208, "10'2\" x 8'0\""),
  imageRect("dining", "Dining", 258, 640, 315, 246, "14'6\" x 14'6\""),
  imageRect("bed-left", "Bedroom", 586, 635, 170, 222, "14'2\" x 12'1\""),
  imageRect("bed-right", "Bedroom", 755, 635, 224, 222, "14'0\" x 10'7\""),
];

const supportZones = [
  imageRect("master-bath", "Master bath", 356, 43, 148, 154),
  imageRect("master-closet", "Dressing", 356, 198, 148, 155),
  imageRect("entry", "Entry", 590, 276, 216, 84),
  imageRect("hall", "Hall", 590, 432, 275, 82),
  imageRect("bath-core", "Bath/core", 472, 432, 116, 208),
  imageRect("right-bath", "Bath", 835, 399, 144, 75),
  imageRect("right-closet", "Dressing", 835, 474, 144, 153),
];

const stage = document.querySelector("#stage");
const plan = document.querySelector("#plan");
const roomLayer = document.querySelector("#roomLayer");
const furnitureLayer = document.querySelector("#furnitureLayer");
const presetGrid = document.querySelector("#presetGrid");
const scaleReadout = document.querySelector("#scaleReadout");
const selectedName = document.querySelector("#selectedName");
const selectedSize = document.querySelector("#selectedSize");
const rotateSelected = document.querySelector("#rotateSelected");
const duplicateSelected = document.querySelector("#duplicateSelected");
const deleteSelected = document.querySelector("#deleteSelected");
const clearLayout = document.querySelector("#clearLayout");
const togglePanel = document.querySelector("#togglePanel");
const resetView = document.querySelector("#resetView");

const state = {
  selectedId: null,
  pieces: [],
  panelHidden: false,
  view: { x: 0, y: 0, zoom: 1 },
};

let dragState = null;
let panState = null;
let pinchState = null;
const activeTouches = new Map();

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function feetToPx(feet) {
  return feet * PX_PER_FOOT;
}

function inchesToFeet(inches) {
  return inches / 12;
}

function inchesToPx(inches) {
  return feetToPx(inchesToFeet(inches));
}

function formatInches(inches) {
  const wholeFeet = Math.floor(inches / 12);
  const remainingInches = Number((inches - wholeFeet * 12).toFixed(3));
  const inchText = Number.isInteger(remainingInches)
    ? String(remainingInches)
    : String(remainingInches).replace(/0+$/, "");
  if (wholeFeet === 0) return `${inchText}"`;
  return `${wholeFeet}'${inchText}"`;
}

function getDisplayName(item) {
  return item.displayName ?? item.name;
}

function getPieceLabel(item) {
  return item.label ?? getDisplayName(item).replace(" bed", "");
}

function roundForUrl(value) {
  return Number(value.toFixed(4));
}

function encodeBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function pieceFromStored(rawPiece) {
  const type = rawPiece.type ?? rawPiece.t;
  const preset = presets.find((item) => item.type === type);
  const piece = {
    id: rawPiece.id ?? uid(),
    type,
    name: preset?.name ?? rawPiece.name ?? rawPiece.n ?? "Furniture",
    displayName: preset?.displayName ?? rawPiece.displayName ?? rawPiece.dn,
    label: preset?.label ?? rawPiece.label ?? rawPiece.l,
    widthIn: Number(preset?.widthIn ?? rawPiece.widthIn ?? rawPiece.w),
    depthIn: Number(preset?.depthIn ?? rawPiece.depthIn ?? rawPiece.d),
    color: preset?.color ?? rawPiece.color ?? rawPiece.c ?? "#d8dee9",
    x: Number(rawPiece.x),
    y: Number(rawPiece.y),
    rotated: Boolean(rawPiece.rotated ?? rawPiece.r),
  };

  if (!piece.type || !Number.isFinite(piece.widthIn) || !Number.isFinite(piece.depthIn)) return null;
  if (!Number.isFinite(piece.x) || !Number.isFinite(piece.y)) return null;
  return piece;
}

function serializeLayoutForUrl() {
  return {
    v: URL_LAYOUT_VERSION,
    p: state.pieces.map((piece) => ({
      t: piece.type,
      x: roundForUrl(piece.x),
      y: roundForUrl(piece.y),
      r: piece.rotated ? 1 : 0,
      w: piece.widthIn,
      d: piece.depthIn,
      n: piece.name,
      dn: piece.displayName,
      l: piece.label,
      c: piece.color,
    })),
  };
}

function updateLayoutUrl() {
  const url = new URL(window.location.href);
  if (state.pieces.length) {
    url.searchParams.set(URL_LAYOUT_PARAM, encodeBase64Url(JSON.stringify(serializeLayoutForUrl())));
  } else {
    url.searchParams.delete(URL_LAYOUT_PARAM);
  }
  window.history.replaceState(null, "", url);
}

function saveLayout() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      pieces: state.pieces,
    }),
  );
  updateLayoutUrl();
}

function loadLayoutFromUrl() {
  const encoded = new URLSearchParams(window.location.search).get(URL_LAYOUT_PARAM);
  if (!encoded) return false;

  try {
    const decoded = JSON.parse(decodeBase64Url(encoded));
    const rawPieces = Array.isArray(decoded.p) ? decoded.p : decoded.pieces;
    if (!Array.isArray(rawPieces)) return false;
    state.pieces = rawPieces.map(pieceFromStored).filter(Boolean);
    state.selectedId = null;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ pieces: state.pieces }));
    updateLayoutUrl();
    return true;
  } catch {
    return false;
  }
}

function loadLayoutFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  try {
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.pieces)) {
      state.pieces = saved.pieces.map(pieceFromStored).filter(Boolean);
      updateLayoutUrl();
      return true;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return false;
}

function loadLayout() {
  if (!loadLayoutFromUrl()) loadLayoutFromStorage();
}

function getPieceSize(piece) {
  const widthIn = piece.rotated ? piece.depthIn : piece.widthIn;
  const depthIn = piece.rotated ? piece.widthIn : piece.depthIn;
  return {
    widthIn,
    depthIn,
    widthFt: inchesToFeet(widthIn),
    depthFt: inchesToFeet(depthIn),
    widthPx: inchesToPx(widthIn),
    depthPx: inchesToPx(depthIn),
  };
}

function getPieceRect(piece) {
  const size = getPieceSize(piece);
  return {
    x: piece.x,
    y: piece.y,
    width: size.widthFt,
    height: size.depthFt,
  };
}

function rectContains(outer, inner) {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.widthFt &&
    inner.y + inner.height <= outer.y + outer.depthFt
  );
}

function rectsIntersect(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function findContainingRoom(piece) {
  const rect = getPieceRect(piece);
  return exactRooms.find((room) => rectContains(room, rect));
}

function getWarnings(piece) {
  const warnings = [];
  const rect = getPieceRect(piece);
  const room = findContainingRoom(piece);

  if (!room) warnings.push("outside exact room bounds");

  state.pieces.forEach((other) => {
    if (other.id !== piece.id && rectsIntersect(rect, getPieceRect(other))) warnings.push(`overlaps ${other.name}`);
  });

  return warnings;
}

function snap(value) {
  return Math.round(feetToPx(value)) / PX_PER_FOOT;
}

function clampPiece(piece) {
  const size = getPieceSize(piece);
  piece.x = Math.max(0, Math.min(WORLD.widthFt - size.widthFt, piece.x));
  piece.y = Math.max(0, Math.min(WORLD.depthFt - size.depthFt, piece.y));
}

function addPiece(preset, x = WORLD.widthFt / 2, y = WORLD.depthFt / 2) {
  const piece = {
    id: uid(),
    type: preset.type,
    name: preset.name,
    displayName: preset.displayName,
    label: preset.label,
    widthIn: preset.widthIn,
    depthIn: preset.depthIn,
    color: preset.color,
    x,
    y,
    rotated: false,
  };

  clampPiece(piece);
  state.pieces.push(piece);
  state.selectedId = piece.id;
  saveLayout();
  render();
}

function getPresetSizeFeet(preset) {
  return {
    width: inchesToFeet(preset.widthIn),
    height: inchesToFeet(preset.depthIn),
  };
}

function getPreferredRoomIds(preset) {
  if (preset.type === "king") return ["master", "bed-left", "bed-right", "living"];
  if (preset.type === "queen") return ["bed-left", "master", "bed-right", "office"];
  if (preset.type === "full") return ["bed-right", "bed-left", "office", "master"];
  if (preset.type === "sofa") return ["living", "office", "master"];
  if (preset.type === "tv-stand") return ["living", "master", "bed-left", "bed-right", "office"];
  if (preset.type.startsWith("nightstand")) return ["master", "bed-left", "bed-right", "office"];
  if (preset.type === "dresser") return ["master", "bed-left", "bed-right", "office"];
  if (preset.type.startsWith("dining-table")) return ["dining", "living", "office"];
  if (preset.type === "viv-swivel-chair") return ["living", "master", "bed-left", "bed-right", "office"];
  if (preset.type === "cybex-stroller") return ["living", "master", "office"];
  if (preset.type.endsWith("scooter")) return ["living", "master", "office"];
  if (preset.type === "forma-coffee-table") return ["living", "office", "master"];
  return ["bed-left", "bed-right", "master"];
}

function getRoomAtPoint(preferredPoint, preset) {
  const pieceSize = getPresetSizeFeet(preset);
  return exactRooms.find(
    (room) =>
      preferredPoint.x >= room.x &&
      preferredPoint.x <= room.x + room.widthFt &&
      preferredPoint.y >= room.y &&
      preferredPoint.y <= room.y + room.depthFt &&
      pieceSize.width <= room.widthFt &&
      pieceSize.height <= room.depthFt,
  );
}

function candidateFits(candidate, size) {
  const rect = { x: candidate.x, y: candidate.y, width: size.width, height: size.height };
  const overlapsPiece = state.pieces.some((piece) => rectsIntersect(rect, getPieceRect(piece)));
  return !overlapsPiece;
}

function findFreePositionInRoom(preset, room) {
  const size = getPresetSizeFeet(preset);
  const maxX = room.x + room.widthFt - size.width;
  const maxY = room.y + room.depthFt - size.height;
  if (maxX < room.x || maxY < room.y) return null;

  const centered = {
    x: room.x + (room.widthFt - size.width) / 2,
    y: room.y + (room.depthFt - size.height) / 2,
  };
  if (candidateFits(centered, size)) return centered;

  const step = 0.5;
  for (let y = room.y; y <= maxY + 0.001; y += step) {
    for (let x = room.x; x <= maxX + 0.001; x += step) {
      const candidate = { x: snap(x), y: snap(y) };
      if (candidateFits(candidate, size)) return candidate;
    }
  }

  return centered;
}

function findDropPosition(preset, preferredPoint) {
  const preferredIds = getPreferredRoomIds(preset);
  const roomAtPoint = getRoomAtPoint(preferredPoint, preset);
  const orderedRooms = [
    ...preferredIds.map((id) => exactRooms.find((room) => room.id === id)),
    roomAtPoint,
  ].filter(Boolean);
  const uniqueRooms = orderedRooms.filter((room, index) => orderedRooms.findIndex((item) => item.id === room.id) === index);

  for (const room of uniqueRooms) {
    const position = findFreePositionInRoom(preset, room);
    if (position && candidateFits(position, getPresetSizeFeet(preset))) return position;
  }

  const fallbackRoom = uniqueRooms[0];
  if (fallbackRoom) {
    const size = getPresetSizeFeet(preset);
    return {
      x: fallbackRoom.x + (fallbackRoom.widthFt - size.width) / 2,
      y: fallbackRoom.y + (fallbackRoom.depthFt - size.height) / 2,
    };
  }

  return {
    x: preferredPoint.x - inchesToFeet(preset.widthIn) / 2,
    y: preferredPoint.y - inchesToFeet(preset.depthIn) / 2,
  };
}

function setView(nextView) {
  const stageRect = stage.getBoundingClientRect();
  const planWidth = feetToPx(WORLD.widthFt);
  const planHeight = feetToPx(WORLD.depthFt);
  const minZoom = Math.min(stageRect.width / planWidth, stageRect.height / planHeight);
  state.view.zoom = Math.max(minZoom * 0.88, Math.min(2.8, nextView.zoom));
  state.view.x = nextView.x;
  state.view.y = nextView.y;
  plan.style.transform = `translate(${state.view.x}px, ${state.view.y}px) scale(${state.view.zoom})`;
}

function fitView() {
  const stageRect = stage.getBoundingClientRect();
  const planWidth = feetToPx(WORLD.widthFt);
  const planHeight = feetToPx(WORLD.depthFt);
  const zoom = Math.min(stageRect.width / planWidth, stageRect.height / planHeight) * 0.96;
  setView({
    zoom,
    x: (stageRect.width - planWidth * zoom) / 2,
    y: (stageRect.height - planHeight * zoom) / 2,
  });
}

function clientToPlanPoint(clientX, clientY) {
  const stageRect = stage.getBoundingClientRect();
  return {
    x: (clientX - stageRect.left - state.view.x) / state.view.zoom / PX_PER_FOOT,
    y: (clientY - stageRect.top - state.view.y) / state.view.zoom / PX_PER_FOOT,
  };
}

function getStageCenterPoint() {
  const stageRect = stage.getBoundingClientRect();
  return clientToPlanPoint(stageRect.left + stageRect.width / 2, stageRect.top + stageRect.height / 2);
}

function placeElement(el, item) {
  el.style.left = `${feetToPx(item.x)}px`;
  el.style.top = `${feetToPx(item.y)}px`;
  el.style.width = `${feetToPx(item.widthFt)}px`;
  el.style.height = `${feetToPx(item.depthFt)}px`;
}

function renderRooms() {
  roomLayer.innerHTML = "";

  supportZones.forEach((zone) => {
    const el = document.createElement("div");
    el.className = "room support-zone";
    placeElement(el, zone);
    el.innerHTML = `<span>${zone.name}</span>`;
    roomLayer.append(el);
  });

  exactRooms.forEach((room) => {
    const el = document.createElement("div");
    el.className = "room exact-room";
    placeElement(el, room);
    el.innerHTML = `<strong>${room.name}</strong><span>${room.label}</span>`;
    roomLayer.append(el);
  });
}

function renderPresets() {
  presetGrid.innerHTML = "";
  presets.forEach((preset) => {
    const button = document.createElement("button");
    button.className = "preset";
    button.type = "button";
    const sizeLabel = `${formatInches(preset.widthIn)} x ${formatInches(preset.depthIn)}`;
    const displayName = getDisplayName(preset);
    button.title = `${displayName} ${sizeLabel}`;
    button.setAttribute("aria-label", `${displayName} ${sizeLabel}`);
    button.innerHTML = `<strong>${displayName}</strong><span>${sizeLabel}</span>`;
    button.addEventListener("click", () => {
      const center = getStageCenterPoint();
      const drop = findDropPosition(preset, center);
      addPiece(preset, drop.x, drop.y);
    });
    presetGrid.append(button);
  });
}

function renderPieces() {
  furnitureLayer.innerHTML = "";
  state.pieces.forEach((piece) => {
    clampPiece(piece);
    const size = getPieceSize(piece);
    const warnings = getWarnings(piece);
    const el = document.createElement("button");
    el.type = "button";
    el.className = `piece${piece.id === state.selectedId ? " selected" : ""}${warnings.length ? " warning" : ""}`;
    el.style.left = `${feetToPx(piece.x)}px`;
    el.style.top = `${feetToPx(piece.y)}px`;
    el.style.setProperty("--w", `${size.widthPx}px`);
    el.style.setProperty("--h", `${size.depthPx}px`);
    el.style.setProperty("--piece-color", piece.color);
    el.dataset.id = piece.id;
    el.title = warnings.length ? warnings.join(", ") : "Fits inside exact room bounds";
    el.textContent = getPieceLabel(piece);
    el.addEventListener("pointerdown", startDrag);
    furnitureLayer.append(el);
  });
}

function renderSelection() {
  const selected = state.pieces.find((piece) => piece.id === state.selectedId);
  const hasSelection = Boolean(selected);
  rotateSelected.disabled = !hasSelection;
  duplicateSelected.disabled = !hasSelection;
  deleteSelected.disabled = !hasSelection;

  if (!selected) {
    selectedName.textContent = "No item selected";
    selectedSize.textContent = "Tap a piece";
    return;
  }

  const size = getPieceSize(selected);
  const room = findContainingRoom(selected);
  const warnings = getWarnings(selected);
  const status = warnings.length ? warnings[0] : `fits in ${room?.name ?? "world"}`;
  selectedName.textContent = getDisplayName(selected);
  selectedSize.textContent = `${formatInches(size.widthIn)} x ${formatInches(size.depthIn)} | ${status}`;
}

function render() {
  document.querySelector(".app-shell").classList.toggle("panel-hidden", state.panelHidden);
  togglePanel.textContent = state.panelHidden ? "Tools" : "Plan";
  togglePanel.setAttribute("aria-label", state.panelHidden ? "Show furniture controls" : "Show floor plan only");
  plan.style.width = `${feetToPx(WORLD.widthFt)}px`;
  plan.style.height = `${feetToPx(WORLD.depthFt)}px`;
  scaleReadout.textContent = "image-calibrated plan";
  renderRooms();
  renderPieces();
  renderSelection();
}

function startDrag(event) {
  const target = event.currentTarget;
  const piece = state.pieces.find((item) => item.id === target.dataset.id);
  if (!piece) return;

  event.stopPropagation();
  target.setPointerCapture(event.pointerId);
  const point = clientToPlanPoint(event.clientX, event.clientY);
  dragState = {
    pointerId: event.pointerId,
    piece,
    offsetX: point.x - piece.x,
    offsetY: point.y - piece.y,
  };
  state.selectedId = piece.id;
  target.classList.add("dragging");
  renderSelection();
}

function moveDrag(event) {
  if (!dragState || dragState.pointerId !== event.pointerId) return;

  const point = clientToPlanPoint(event.clientX, event.clientY);
  dragState.piece.x = snap(point.x - dragState.offsetX);
  dragState.piece.y = snap(point.y - dragState.offsetY);
  clampPiece(dragState.piece);
  renderPieces();
  renderSelection();
}

function endDrag(event) {
  if (!dragState || dragState.pointerId !== event.pointerId) return;
  dragState = null;
  saveLayout();
  render();
}

function startPan(event) {
  if (event.target.closest(".piece")) return;
  stage.setPointerCapture(event.pointerId);
  panState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    viewX: state.view.x,
    viewY: state.view.y,
  };
}

function movePan(event) {
  if (!panState || panState.pointerId !== event.pointerId || pinchState) return;
  setView({
    ...state.view,
    x: panState.viewX + event.clientX - panState.startX,
    y: panState.viewY + event.clientY - panState.startY,
  });
}

function endPan(event) {
  if (panState?.pointerId === event.pointerId) panState = null;
}

function updatePinch() {
  if (activeTouches.size !== 2) {
    pinchState = null;
    return;
  }

  const touches = [...activeTouches.values()];
  const [a, b] = touches;
  const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  const center = {
    x: (a.clientX + b.clientX) / 2,
    y: (a.clientY + b.clientY) / 2,
  };

  if (!pinchState) {
    pinchState = {
      distance,
      center,
      view: { ...state.view },
      planPoint: clientToPlanPoint(center.x, center.y),
    };
    return;
  }

  const nextZoom = pinchState.view.zoom * (distance / pinchState.distance);
  const stageRect = stage.getBoundingClientRect();
  const centerInStage = {
    x: center.x - stageRect.left,
    y: center.y - stageRect.top,
  };

  setView({
    zoom: nextZoom,
    x: centerInStage.x - feetToPx(pinchState.planPoint.x) * nextZoom,
    y: centerInStage.y - feetToPx(pinchState.planPoint.y) * nextZoom,
  });
}

stage.addEventListener("pointerdown", (event) => {
  activeTouches.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
  if (activeTouches.size === 1) startPan(event);
  updatePinch();
});

stage.addEventListener("pointermove", (event) => {
  if (activeTouches.has(event.pointerId)) {
    activeTouches.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
    updatePinch();
  }
  movePan(event);
});

stage.addEventListener("pointerup", (event) => {
  activeTouches.delete(event.pointerId);
  endPan(event);
  updatePinch();
});

stage.addEventListener("pointercancel", (event) => {
  activeTouches.delete(event.pointerId);
  endPan(event);
  updatePinch();
});

window.addEventListener("pointermove", moveDrag);
window.addEventListener("pointerup", endDrag);
window.addEventListener("pointercancel", endDrag);

stage.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    const point = clientToPlanPoint(event.clientX, event.clientY);
    const nextZoom = state.view.zoom * (event.deltaY > 0 ? 0.92 : 1.08);
    const stageRect = stage.getBoundingClientRect();
    setView({
      zoom: nextZoom,
      x: event.clientX - stageRect.left - feetToPx(point.x) * nextZoom,
      y: event.clientY - stageRect.top - feetToPx(point.y) * nextZoom,
    });
  },
  { passive: false },
);

rotateSelected.addEventListener("click", () => {
  const piece = state.pieces.find((item) => item.id === state.selectedId);
  if (!piece) return;
  piece.rotated = !piece.rotated;
  clampPiece(piece);
  saveLayout();
  render();
});

duplicateSelected.addEventListener("click", () => {
  const piece = state.pieces.find((item) => item.id === state.selectedId);
  if (!piece) return;
  const clone = { ...piece, id: uid(), x: piece.x + 1, y: piece.y + 1 };
  clampPiece(clone);
  state.pieces.push(clone);
  state.selectedId = clone.id;
  saveLayout();
  render();
});

deleteSelected.addEventListener("click", () => {
  state.pieces = state.pieces.filter((item) => item.id !== state.selectedId);
  state.selectedId = null;
  saveLayout();
  render();
});

clearLayout.addEventListener("click", () => {
  state.pieces = [];
  state.selectedId = null;
  saveLayout();
  render();
});

togglePanel.addEventListener("click", () => {
  state.panelHidden = !state.panelHidden;
  render();
  requestAnimationFrame(fitView);
});

resetView.addEventListener("click", fitView);
window.addEventListener("resize", fitView);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

loadLayout();
renderPresets();

function initializeView() {
  fitView();
  render();
}

initializeView();
requestAnimationFrame(() => {
  initializeView();
});
setTimeout(initializeView, 80);
