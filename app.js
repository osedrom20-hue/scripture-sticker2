/* =========================
   ELEMENTOS DEL DOM
========================= */
const scriptureInput = document.getElementById("scriptureInput");
const applyTextBtn = document.getElementById("applyTextBtn");
const materialImportBtn = document.getElementById("materialImportBtn");
const materialImportInput = document.getElementById("materialImportInput");
const materialImportStatus = document.getElementById("materialImportStatus");
const scriptureText = document.getElementById("scriptureText");
const sticker = document.getElementById("sticker");
const stickerUpload = document.getElementById("stickerUpload");
const stickerUploadBtn = document.getElementById("stickerUploadBtn");
const stickerCounterLabels = document.querySelectorAll("[data-sticker-counter]");
const stickerLimitNotices = document.querySelectorAll("[data-sticker-limit-notice]");

const opacityRange = document.getElementById("opacityRange");
const opacityValue = document.getElementById("opacityValue");
const sizeRange = document.getElementById("sizeRange");
const sizeValue = document.getElementById("sizeValue");

const resetStickerBtn = document.getElementById("resetStickerBtn");
const newProjectBtn = document.getElementById("newProjectBtn");
const saveProjectBtn = document.getElementById("saveProjectBtn");
const loadProjectBtn = document.getElementById("loadProjectBtn");

const exportProjectBtn = document.getElementById("exportProjectBtn");
const importProjectBtn = document.getElementById("importProjectBtn");
const importProjectInput = document.getElementById("importProjectInput");

const exportBtn = document.getElementById("exportBtn");
const shareBtn = document.getElementById("shareBtn");

const backgroundSelect = document.getElementById("backgroundSelect");
const projectNameInput = document.getElementById("projectNameInput");

const edgeSoftnessRange = document.getElementById("edgeSoftnessRange");
const edgeSoftnessValue = document.getElementById("edgeSoftnessValue");
const colorBoostRange = document.getElementById("colorBoostRange");
const colorBoostValue = document.getElementById("colorBoostValue");

const captureArea = document.getElementById("captureArea");

const controlsDrawer = document.getElementById("controlsDrawer");
const closeDrawerBtn = document.getElementById("closeDrawerBtn");
const mobileDrawerTitle = document.getElementById("mobileDrawerTitle");
const mobilePanelBlocks = document.querySelectorAll(".mobile-panel-block");

const mobileMenuTrigger = document.getElementById("mobileMenuTrigger");
const floatingToolbar = document.getElementById("floatingToolbar");
const floatingToolbarButtons = document.querySelectorAll(".floating-toolbar button");
const advancedSubmenu = document.getElementById("advancedSubmenu");

const openStickerLibraryBtn = document.getElementById("openStickerLibraryBtn");
const stickerLibraryModal = document.getElementById("stickerLibraryModal");
const closeStickerLibraryBtn = document.getElementById("closeStickerLibraryBtn");
const useSelectedStickerBtn = document.getElementById("useSelectedStickerBtn");
const stickerLibraryPreview = document.getElementById("stickerLibraryPreview");
const stickerLibraryName = document.getElementById("stickerLibraryName");

/* =========================
   CONFIGURACIÓN
========================= */
const AUTO_OPACITY = "30";
const AUTO_EDGE_SOFTNESS = "6";
const AUTO_COLOR_BOOST = "120";

const STICKER_DOUBLE_TAP_DELAY = 350;
const STICKER_DOUBLE_TAP_DISTANCE = 28;
const STICKER_DRAG_START_DISTANCE = 6;

const LIBRARY_JSON_PATH = "stickers/library.json";
const MAX_STICKERS = 3;

/* =========================
   ESTADO
========================= */
let textStepDone = false;
let stickerStepDone = false;
let sizeStepDone = false;
let projectStepDone = false;
let exportStepDone = false;
let shareStepDone = false;

let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let activeSticker = sticker;
let stickerCounter = 0;
let stickerLimitNoticeTimer = null;

let stickerLocked = false;
let lastStickerTapTime = 0;
let lastStickerTapX = 0;
let lastStickerTapY = 0;
let activeStickerPointerId = null;
let pendingUnlockedPointer = null;
let pendingUnlockedPointerId = null;

let longPressTimer = null;
let longPressStartX = 0;
let longPressStartY = 0;

let stickerLibraryData = [];
let selectedLibraryPrincipleId = null;
let selectedLibraryImageId = null;
let selectedLibraryStickerSrc = "";
let selectedLibraryStickerName = "Sticker";

let libraryCarouselEl = null;
let libraryImagesEl = null;
let libraryStatusEl = null;

const mobilePanelTitles = {
  text: "Texto",
  sticker: "Sticker",
  size: "Tamanho",
  actions: "Ações"
};

/* =========================
   UTILIDADES
========================= */
function isMobileView() {
  return window.matchMedia("(max-width: 850px)").matches;
}

function clearGuideGlow() {
  document.querySelectorAll(".guided-glow").forEach((item) => {
    item.classList.remove("guided-glow");
  });
}

function hideSticker() {
  if (!sticker) return;
  getStickerElements().forEach((item) => {
    item.style.display = "none";
    item.classList.remove("selected");
  });
  updateStickerCounter();
}

function showSticker() {
  if (!sticker) return;
  getStickerElements().forEach((item) => {
    item.style.display = "block";
  });
}

function getStickerElements() {
  return Array.from(captureArea.querySelectorAll(".sticker"));
}

function getActiveSticker() {
  if (activeSticker && captureArea.contains(activeSticker)) {
    return activeSticker;
  }

  const stickers = getStickerElements();
  activeSticker = stickers[0] || sticker;
  return activeSticker;
}

function setupStickerElement(stickerElement) {
  stickerElement.setAttribute("draggable", "false");
  stickerElement.style.touchAction = "none";
  stickerElement.style.userSelect = "none";
  stickerElement.style.webkitUserDrag = "none";

  if (stickerElement.dataset.ready === "true") return;

  stickerElement.dataset.ready = "true";
  stickerElement.addEventListener("pointerdown", startDrag, { passive: false });
  stickerElement.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });
  stickerElement.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
}

function syncControlsFromActiveSticker() {
  const currentSticker = getActiveSticker();
  if (!currentSticker) return;
  const width = parseInt(currentSticker.style.width, 10) || 210;
  const opacity = Math.round((Number(currentSticker.style.opacity || 0.3)) * 100);
  sizeRange.value = String(width);
  sizeValue.textContent = width + " px";
  opacityRange.value = String(opacity);
  opacityValue.textContent = opacity + "%";
}

function selectActiveSticker(stickerElement) {
  if (!stickerElement) return;
  getStickerElements().forEach((item) => {
    item.classList.toggle("selected", item === stickerElement);
  });
  activeSticker = stickerElement;
  stickerLocked = stickerElement.dataset.locked === "true";
  syncControlsFromActiveSticker();
}

function createStickerElement() {
  stickerCounter += 1;
  const stickerElement = sticker.cloneNode(false);
  stickerElement.id = "sticker-" + (stickerCounter + 1);
  stickerElement.classList.remove("selected", "center-flash");
  stickerElement.dataset.locked = "false";
  stickerElement.dataset.ready = "";
  captureArea.appendChild(stickerElement);
  setupStickerElement(stickerElement);
  return stickerElement;
}

function getVisibleStickerCount() {
  return getStickerElements().filter((item) => {
    return item.style.display !== "none" && (item.getAttribute("src") || item.src);
  }).length;
}

function updateStickerCounter() {
  const counterText = `Stickers ${getVisibleStickerCount()}/${MAX_STICKERS}`;

  stickerCounterLabels.forEach((counterLabel) => {
    counterLabel.textContent = counterText;
  });
}

function showStickerLimitNotice() {
  if (!stickerLimitNotices.length) return;

  window.clearTimeout(stickerLimitNoticeTimer);

  stickerLimitNotices.forEach((notice) => {
    notice.classList.remove("is-visible");
    notice.setAttribute("aria-hidden", "false");
  });

  window.requestAnimationFrame(() => {
    stickerLimitNotices.forEach((notice) => {
      notice.classList.add("is-visible");
    });
  });

  stickerLimitNoticeTimer = window.setTimeout(() => {
    stickerLimitNotices.forEach((notice) => {
      notice.classList.remove("is-visible");
      notice.setAttribute("aria-hidden", "true");
    });
  }, 2400);
}

function canAddSticker() {
  return getVisibleStickerCount() < MAX_STICKERS;
}

function getAvailableStickerSlot() {
  if (!canAddSticker()) {
    showStickerLimitNotice();
    updateStickerCounter();
    return null;
  }

  const stickers = getStickerElements();
  const emptySticker = stickers.find((item) => item.style.display === "none" || (!item.getAttribute("src") && !item.src));
  if (emptySticker) return emptySticker;

  if (stickers.length < MAX_STICKERS) {
    return createStickerElement();
  }

  showStickerLimitNotice();
  updateStickerCounter();
  return null;
}

function placeStickerImage(src, alt = "Sticker digital") {
  const targetSticker = getAvailableStickerSlot();

  if (!targetSticker) {
    updateStickerCounter();
    return false;
  }

  targetSticker.src = src;
  targetSticker.alt = alt;
  targetSticker.style.display = "block";
  targetSticker.dataset.locked = "false";
  selectActiveSticker(targetSticker);
  centerSticker();
  applyAutomaticStickerSettings();
  stickerStepDone = true;
  stickerLocked = false;
  sizeStepDone = false;
  projectStepDone = false;
  exportStepDone = false;
  shareStepDone = false;
  updateStickerCounter();

  if (getVisibleStickerCount() >= MAX_STICKERS) {
    showStickerLimitNotice();
  }

  return true;
}

function removeExtraStickers() {
  getStickerElements().forEach((item) => {
    if (item !== sticker) item.remove();
  });
  activeSticker = sticker;
  updateStickerCounter();
}

function serializeSticker(stickerElement) {
  return {
    src: stickerElement.getAttribute("src") || stickerElement.src || "",
    alt: stickerElement.alt || "Sticker digital",
    left: stickerElement.style.left,
    top: stickerElement.style.top,
    width: stickerElement.style.width,
    opacity: stickerElement.style.opacity,
    filter: stickerElement.style.filter,
    maskImage: stickerElement.style.maskImage,
    webkitMaskImage: stickerElement.style.webkitMaskImage,
    locked: stickerElement.dataset.locked === "true"
  };
}

function applySerializedSticker(stickerData, index) {
  const stickerElement = index === 0 ? sticker : createStickerElement();
  stickerElement.src = stickerData.src;
  stickerElement.alt = stickerData.alt || "Sticker digital";
  stickerElement.style.left = stickerData.left || "110px";
  stickerElement.style.top = stickerData.top || "330px";
  stickerElement.style.width = stickerData.width || "210px";
  stickerElement.style.opacity = stickerData.opacity || "0.30";
  stickerElement.style.filter = stickerData.filter || "";
  stickerElement.style.maskImage = stickerData.maskImage || "";
  stickerElement.style.webkitMaskImage = stickerData.webkitMaskImage || "";
  stickerElement.dataset.locked = stickerData.locked ? "true" : "false";
  stickerElement.style.display = "block";
  setupStickerElement(stickerElement);
  return stickerElement;
}

function updateStartGlow() {
  if (!mobileMenuTrigger) return;

  const hasText =
    scriptureInput.value.trim().length > 0 ||
    scriptureText.textContent.trim().length > 0;

  if (isMobileView() && !hasText) {
    mobileMenuTrigger.classList.add("start-glow");
  } else {
    mobileMenuTrigger.classList.remove("start-glow");
  }
}

function updateGuideGlow() {
  clearGuideGlow();
  updateStartGlow();

  if (!scriptureInput.value.trim()) {
    scriptureInput.classList.add("guided-glow");
    return;
  }

  if (!textStepDone) {
    applyTextBtn.classList.add("guided-glow");
    return;
  }

  if (!stickerStepDone) {
    if (openStickerLibraryBtn) {
      openStickerLibraryBtn.classList.add("guided-glow");
    } else {
      stickerUpload.classList.add("guided-glow");
    }
    return;
  }

  if (!sizeStepDone) {
    sizeRange.classList.add("guided-glow");
    return;
  }

  if (!exportStepDone) {
    exportBtn.classList.add("guided-glow");
  }
}

function resetWorkflowAfterTextChange() {
  stickerStepDone = false;
  stickerLocked = false;
  sizeStepDone = false;
  projectStepDone = false;
  exportStepDone = false;
  shareStepDone = false;
}

function getSafeProjectFileName() {
  const typedName = projectNameInput.value.trim();

  if (!typedName) return "scripture-sticker";

  const safeName = typedName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safeName || "scripture-sticker";
}

function setMaterialImportStatus(message = "", type = "") {
  if (!materialImportStatus) return;

  materialImportStatus.textContent = message;
  materialImportStatus.classList.remove("success", "warning", "error");

  if (type) {
    materialImportStatus.classList.add(type);
  }
}

function getFileExtension(fileName = "") {
  const dotIndex = fileName.lastIndexOf(".");

  if (dotIndex === -1) return "";

  return fileName.slice(dotIndex + 1).toLowerCase();
}

function markImportedTextAsUnsaved() {
  textStepDone = false;
  projectStepDone = false;
  exportStepDone = false;
  shareStepDone = false;
  updateGuideGlow();
}

function readTextMaterial(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result || "");
    };

    reader.onerror = () => {
      reject(reader.error || new Error("Erro ao ler arquivo"));
    };

    reader.readAsText(file, "UTF-8");
  });
}

async function importMaterialFile(event) {
  const file = event.target.files[0];

  if (!file) return;

  try {
    const extension = getFileExtension(file.name);

    if (extension === "txt") {
      const importedText = await readTextMaterial(file);

      scriptureInput.value = importedText;
      markImportedTextAsUnsaved();
      setMaterialImportStatus("Material importado com sucesso.", "success");
      return;
    }

    if (extension === "docx" || extension === "pdf") {
      setMaterialImportStatus(
        "Formato ainda não compatível nesta versão.",
        "warning"
      );
      return;
    }

    setMaterialImportStatus(
      "Formato ainda não compatível nesta versão.",
      "warning"
    );
  } catch (error) {
    console.error(error);
    setMaterialImportStatus("Não foi possível importar o material.", "error");
  } finally {
    materialImportInput.value = "";
  }
}

/* =========================
   TEXTO
========================= */
function applyText() {
  const text = scriptureInput.value.trim();
  scriptureText.textContent = text;

  if (text.length > 0) {
    textStepDone = true;
    projectStepDone = false;
    exportStepDone = false;
    shareStepDone = false;
  } else {
    textStepDone = false;
    resetWorkflowAfterTextChange();
    hideSticker();
  }

  updateGuideGlow();
}

/* =========================
   AJUSTES VISUALES
========================= */
function updateOpacity(markStep = true) {
  const value = Number(opacityRange.value);

  getActiveSticker().style.opacity = value / 100;
  opacityValue.textContent = `${value}%`;

  if (markStep) {
    projectStepDone = false;
    exportStepDone = false;
    shareStepDone = false;
    updateGuideGlow();
  }
}

function updateSize(markStep = true) {
  const value = Number(sizeRange.value);

  getActiveSticker().style.width = `${value}px`;
  sizeValue.textContent = `${value} px`;

  if (markStep) {
    sizeStepDone = true;
    projectStepDone = false;
    exportStepDone = false;
    shareStepDone = false;
    updateGuideGlow();
  }
}

function applyBackground(markStep = false) {
  captureArea.classList.remove(
    "bg-white",
    "bg-cream",
    "bg-blue",
    "bg-pink",
    "bg-peach"
  );

  captureArea.classList.add(`bg-${backgroundSelect.value}`);

  if (markStep) {
    projectStepDone = false;
    exportStepDone = false;
    shareStepDone = false;
    updateGuideGlow();
  }
}

function updateStickerEffects(markStep = false) {
  const edge = Number(edgeSoftnessRange.value);
  const colorBoost = Number(colorBoostRange.value);

  edgeSoftnessValue.textContent = `${edge} px`;
  colorBoostValue.textContent = `${colorBoost}%`;

  getActiveSticker().style.filter = `saturate(${colorBoost}%) contrast(105%)`;

  if (edge > 0) {
    const mask = `
      linear-gradient(to right, transparent 0px, black ${edge}px, black calc(100% - ${edge}px), transparent 100%),
      linear-gradient(to bottom, transparent 0px, black ${edge}px, black calc(100% - ${edge}px), transparent 100%)
    `;

    getActiveSticker().style.webkitMaskImage = mask;
    getActiveSticker().style.maskImage = mask;
    getActiveSticker().style.webkitMaskSize = "100% 100%";
    getActiveSticker().style.maskSize = "100% 100%";
    getActiveSticker().style.webkitMaskRepeat = "no-repeat";
    getActiveSticker().style.maskRepeat = "no-repeat";
    getActiveSticker().style.webkitMaskComposite = "source-in";
    getActiveSticker().style.maskComposite = "intersect";
  } else {
    getActiveSticker().style.webkitMaskImage = "none";
    getActiveSticker().style.maskImage = "none";
    getActiveSticker().style.webkitMaskComposite = "";
    getActiveSticker().style.maskComposite = "";
  }

  if (markStep) {
    projectStepDone = false;
    exportStepDone = false;
    shareStepDone = false;
    updateGuideGlow();
  }
}

function applyAutomaticStickerSettings() {
  opacityRange.value = AUTO_OPACITY;
  edgeSoftnessRange.value = AUTO_EDGE_SOFTNESS;
  colorBoostRange.value = AUTO_COLOR_BOOST;

  updateOpacity(false);
  updateStickerEffects(false);
}

/* =========================
   POSICIÓN
========================= */
function centerSticker() {
  const pageRect = captureArea.getBoundingClientRect();
  const currentSticker = getActiveSticker();
  const stickerWidth = currentSticker.offsetWidth || Number(sizeRange.value);

  currentSticker.style.left = `${(pageRect.width - stickerWidth) / 2}px`;
  currentSticker.style.top = `${pageRect.height * 0.48}px`;
}

function flashCenteredSticker() {
  getActiveSticker().classList.add("center-flash");

  setTimeout(() => {
    getActiveSticker().classList.remove("center-flash");
  }, 650);
}

/* =========================
   MOVER / FIJAR / LIBERAR STICKER
========================= */
function getPointerPosition(event) {
  return {
    x: event.clientX,
    y: event.clientY
  };
}

function isSameStickerPointer(event) {
  return (
    activeStickerPointerId === null ||
    event.pointerId === undefined ||
    event.pointerId === activeStickerPointerId
  );
}

function captureStickerPointer(event) {
  activeStickerPointerId = event.pointerId ?? null;

  const currentSticker = getActiveSticker();
  if (event.pointerId !== undefined && currentSticker.setPointerCapture) {
    try {
      currentSticker.setPointerCapture(event.pointerId);
    } catch (error) {}
  }
}

function releaseStickerPointer(event) {
  const currentSticker = getActiveSticker();
  if (event && event.pointerId !== undefined && currentSticker.releasePointerCapture) {
    try {
      currentSticker.releasePointerCapture(event.pointerId);
    } catch (error) {}
  }

  activeStickerPointerId = null;
}

function resetStickerDoubleTapState() {
  lastStickerTapTime = 0;
  lastStickerTapX = 0;
  lastStickerTapY = 0;
}

function isStickerDoubleTap(pointer) {
  const now = Date.now();
  const elapsed = now - lastStickerTapTime;
  const distanceX = Math.abs(pointer.x - lastStickerTapX);
  const distanceY = Math.abs(pointer.y - lastStickerTapY);

  const isDoubleTap =
    elapsed > 0 &&
    elapsed <= STICKER_DOUBLE_TAP_DELAY &&
    distanceX <= STICKER_DOUBLE_TAP_DISTANCE &&
    distanceY <= STICKER_DOUBLE_TAP_DISTANCE;

  lastStickerTapTime = now;
  lastStickerTapX = pointer.x;
  lastStickerTapY = pointer.y;

  if (isDoubleTap) resetStickerDoubleTapState();

  return isDoubleTap;
}

function samePendingUnlockPointer(event) {
  return (
    pendingUnlockedPointerId === null ||
    event.pointerId === undefined ||
    event.pointerId === pendingUnlockedPointerId
  );
}

function clearPendingStickerUnlockEvents() {
  window.removeEventListener("pointermove", handleUnlockedSecondTapMove);
  window.removeEventListener("pointerup", finishStickerUnlockTap);
  window.removeEventListener("pointercancel", finishStickerUnlockTap);

  pendingUnlockedPointer = null;
  pendingUnlockedPointerId = null;
}

function handleUnlockedSecondTapMove(event) {
  if (!pendingUnlockedPointer || !samePendingUnlockPointer(event)) return;

  event.preventDefault();
  event.stopPropagation();

  const pointer = getPointerPosition(event);
  const moveX = Math.abs(pointer.x - pendingUnlockedPointer.x);
  const moveY = Math.abs(pointer.y - pendingUnlockedPointer.y);

  if (
    moveX < STICKER_DRAG_START_DISTANCE &&
    moveY < STICKER_DRAG_START_DISTANCE
  ) {
    return;
  }

  const startPointer = pendingUnlockedPointer;

  clearPendingStickerUnlockEvents();
  beginStickerDrag(startPointer);
  drag(event);
}

function finishStickerUnlockTap(event) {
  if (event && !samePendingUnlockPointer(event)) return;

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  clearPendingStickerUnlockEvents();
  releaseStickerPointer(event);

  stickerLocked = false;
  getActiveSticker().classList.add("selected");
}

function beginStickerDrag(pointer) {
  const currentSticker = getActiveSticker();
  currentSticker.classList.add("selected");

  const stickerRect = currentSticker.getBoundingClientRect();

  isDragging = true;
  dragOffsetX = pointer.x - stickerRect.left;
  dragOffsetY = pointer.y - stickerRect.top;

  window.addEventListener("pointermove", drag, { passive: false });
  window.addEventListener("pointerup", stopDrag);
  window.addEventListener("pointercancel", stopDrag);
}

function startDrag(event) {
  selectActiveSticker(event.currentTarget);
  if (!stickerStepDone) return;

  event.preventDefault();
  event.stopPropagation();

  const pointer = getPointerPosition(event);

  if (stickerLocked) {
    if (!isStickerDoubleTap(pointer)) return;

    stickerLocked = false;
    getActiveSticker().classList.add("selected");

    captureStickerPointer(event);

    pendingUnlockedPointer = pointer;
    pendingUnlockedPointerId = event.pointerId ?? null;

    window.addEventListener("pointermove", handleUnlockedSecondTapMove, {
      passive: false
    });
    window.addEventListener("pointerup", finishStickerUnlockTap);
    window.addEventListener("pointercancel", finishStickerUnlockTap);

    return;
  }

  resetStickerDoubleTapState();
  captureStickerPointer(event);
  beginStickerDrag(pointer);
}

function drag(event) {
  if (!isDragging || !isSameStickerPointer(event)) return;

  event.preventDefault();
  event.stopPropagation();

  const pointer = getPointerPosition(event);
  const pageRect = captureArea.getBoundingClientRect();

  let newLeft = pointer.x - pageRect.left - dragOffsetX;
  let newTop = pointer.y - pageRect.top - dragOffsetY;

  const currentSticker = getActiveSticker();
  const maxLeft = captureArea.clientWidth - currentSticker.offsetWidth;
  const maxTop = captureArea.clientHeight - currentSticker.offsetHeight;

  newLeft = Math.max(0, Math.min(newLeft, maxLeft));
  newTop = Math.max(0, Math.min(newTop, maxTop));

  currentSticker.style.left = `${newLeft}px`;
  currentSticker.style.top = `${newTop}px`;

  projectStepDone = false;
  exportStepDone = false;
  shareStepDone = false;
}

function stopDrag(event) {
  if (event && !isSameStickerPointer(event)) return;

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  clearPendingStickerUnlockEvents();

  isDragging = false;
  stickerLocked = true;
  getActiveSticker().dataset.locked = "true";
  getActiveSticker().classList.remove("selected");

  window.removeEventListener("pointermove", drag);
  window.removeEventListener("pointerup", stopDrag);
  window.removeEventListener("pointercancel", stopDrag);

  resetStickerDoubleTapState();
  releaseStickerPointer(event);

  updateGuideGlow();
}

/* =========================
   PROYECTOS
========================= */
function getProjectData() {
  const stickers = getStickerElements()
    .filter((item) => item.style.display !== "none" && (item.getAttribute("src") || item.src))
    .slice(0, MAX_STICKERS)
    .map(serializeSticker);

  return {
    projectName: projectNameInput.value.trim(),
    text: scriptureInput.value,
    stickers,
    stickerSrc: stickers[0] ? stickers[0].src : "",
    stickerLeft: stickers[0] ? stickers[0].left : "",
    stickerTop: stickers[0] ? stickers[0].top : "",
    stickerWidth: stickers[0] ? stickers[0].width : "",
    stickerOpacity: stickers[0] ? stickers[0].opacity : "",
    opacityRangeValue: opacityRange.value,
    sizeRangeValue: sizeRange.value,
    backgroundValue: backgroundSelect.value,
    edgeSoftnessValue: edgeSoftnessRange.value,
    colorBoostValue: colorBoostRange.value
  };
}

function applyProjectData(projectData, markAsSaved = true) {
  projectNameInput.value = projectData.projectName || "";
  scriptureInput.value = projectData.text || "";
  scriptureText.textContent = projectData.text || "";

  removeExtraStickers();
  sticker.removeAttribute("src");
  hideSticker();

  const projectStickers = Array.isArray(projectData.stickers)
    ? projectData.stickers.slice(0, MAX_STICKERS)
    : projectData.stickerSrc
      ? [{
          src: projectData.stickerSrc,
          left: projectData.stickerLeft,
          top: projectData.stickerTop,
          width: projectData.stickerWidth,
          opacity: projectData.stickerOpacity,
          locked: true
        }]
      : [];

  const restoredStickers = projectStickers
    .filter((item) => item && item.src)
    .map((item, index) => applySerializedSticker(item, index));

  if (restoredStickers.length > 0) {
    selectActiveSticker(restoredStickers[0]);
    stickerStepDone = true;
    stickerLocked = restoredStickers[0].dataset.locked === "true";
  } else {
    stickerStepDone = false;
    stickerLocked = false;
  }

  opacityRange.value = projectData.opacityRangeValue || AUTO_OPACITY;
  sizeRange.value = projectData.sizeRangeValue || "210";
  backgroundSelect.value = projectData.backgroundValue || "white";
  edgeSoftnessRange.value = projectData.edgeSoftnessValue || AUTO_EDGE_SOFTNESS;
  colorBoostRange.value = projectData.colorBoostValue || AUTO_COLOR_BOOST;

  syncControlsFromActiveSticker();
  applyBackground(false);

  textStepDone = scriptureInput.value.trim().length > 0;
  sizeStepDone = true;
  projectStepDone = markAsSaved;
  exportStepDone = false;
  shareStepDone = false;

  updateStickerCounter();
  updateGuideGlow();
}

function saveProject() {
  const projectData = getProjectData();

  localStorage.setItem("scriptureStickersProject", JSON.stringify(projectData));

  projectStepDone = true;
  updateGuideGlow();

  alert("Projeto guardado neste navegador.");
}

function loadProject(showAlert = true) {
  const savedProject = localStorage.getItem("scriptureStickersProject");

  if (!savedProject) {
    if (showAlert) {
      alert("Nenhum projeto guardado foi encontrado neste navegador.");
    }

    return false;
  }

  try {
    const projectData = JSON.parse(savedProject);

    applyProjectData(projectData, true);

    if (showAlert) {
      alert("Projeto aberto.");
    }

    return true;
  } catch (error) {
    console.error(error);

    if (showAlert) {
      alert("O projeto guardado está corrompido ou não pode ser aberto.");
    }

    return false;
  }
}

function exportProjectFile() {
  const projectData = getProjectData();

  const blob = new Blob([JSON.stringify(projectData, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${getSafeProjectFileName()}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function importProjectFile(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (loadEvent) {
    try {
      const projectData = JSON.parse(loadEvent.target.result);

      applyProjectData(projectData, false);

      localStorage.setItem(
        "scriptureStickersProject",
        JSON.stringify(projectData)
      );

      projectStepDone = true;
      updateGuideGlow();

      alert("Projeto importado.");
    } catch (error) {
      console.error(error);
      alert("Não foi possível importar este projeto. Verifique se o arquivo é .json válido.");
    }

    importProjectInput.value = "";
  };

  reader.readAsText(file);
}

function newProject() {
  localStorage.removeItem("scriptureStickersProject");

  projectNameInput.value = "";
  scriptureInput.value = "";
  scriptureText.textContent = "";
  stickerUpload.value = "";
  setMaterialImportStatus();

  removeExtraStickers();
  sticker.removeAttribute("src");
  hideSticker();

  opacityRange.value = AUTO_OPACITY;
  sizeRange.value = "210";
  backgroundSelect.value = "white";
  edgeSoftnessRange.value = AUTO_EDGE_SOFTNESS;
  colorBoostRange.value = AUTO_COLOR_BOOST;

  updateOpacity(false);
  updateSize(false);
  applyBackground(false);
  updateStickerEffects(false);
  centerSticker();

  textStepDone = false;
  stickerStepDone = false;
  stickerLocked = false;
  sizeStepDone = false;
  projectStepDone = false;
  exportStepDone = false;
  shareStepDone = false;

  closeAllFloatingPanels();
  closeStickerLibrary();
  updateStickerCounter();
  updateGuideGlow();
}
function loadStickerFromFile(event) {
  const file = event.target.files[0];

  if (!file) return;

  if (!canAddSticker()) {
    showStickerLimitNotice();
    updateStickerCounter();
    stickerUpload.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (loadEvent) {
    const stickerWasPlaced = placeStickerImage(
      loadEvent.target.result,
      file.name || "Sticker digital"
    );

    stickerUpload.value = "";

    if (!stickerWasPlaced) return;

    closeMobileDrawer();
    closeAdvancedSubmenu();
    updateGuideGlow();
  };

  reader.readAsDataURL(file);
}

/* =========================
   BIBLIOTECA DINÁMICA
========================= */
let libraryCarouselListEl = null;
let libraryCarouselIsMoving = false;

function normalizeLibraryData(data) {
  if (!Array.isArray(data)) return [];

  return data
    .filter((principle) => {
      return (
        principle &&
        typeof principle.id === "string" &&
        typeof principle.name === "string" &&
        Array.isArray(principle.images)
      );
    })
    .map((principle) => {
      return {
        id: principle.id,
        name: principle.name,
        folder: principle.folder || "",
        images: principle.images
          .filter((image) => image && typeof image.src === "string")
          .map((image) => {
            return {
              id: image.id || image.src,
              name: image.name || principle.name,
              src: image.src
            };
          })
      };
    })
    .filter((principle) => principle.images.length > 0);
}

async function loadStickerLibraryJson() {
  try {
    const response = await fetch(LIBRARY_JSON_PATH, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Erro ao carregar ${LIBRARY_JSON_PATH}`);
    }

    const data = await response.json();
    stickerLibraryData = normalizeLibraryData(data);
  } catch (error) {
    console.error(error);
    stickerLibraryData = [];
  }
}

function getFirstImageFromPrinciple(principle) {
  if (!principle || !principle.images || principle.images.length === 0) {
    return null;
  }

  return principle.images[0];
}

function setSelectedPrincipleFirstImage(principle) {
  const firstImage = getFirstImageFromPrinciple(principle);

  if (!firstImage) return;

  selectedLibraryPrincipleId = principle.id;
  selectedLibraryImageId = firstImage.id;
  selectedLibraryStickerSrc = firstImage.src;
  selectedLibraryStickerName = firstImage.name;
}

function hideLibraryImages() {
  if (!libraryImagesEl) return;

  libraryImagesEl.innerHTML = "";
  libraryImagesEl.classList.remove("visible");
  libraryImagesEl.hidden = true;
}

function showLibraryImages(principle) {
  if (!libraryImagesEl || !principle) return;

  renderLibraryImages(principle);
  libraryImagesEl.hidden = false;
  libraryImagesEl.classList.add("visible");
}

function ensureLibraryDynamicLayout() {
  if (!stickerLibraryModal) return;

  document.querySelectorAll(".sticker-library-item").forEach((item) => {
    item.remove();
  });

  let dynamicArea = document.getElementById("dynamicStickerLibraryArea");

  if (!dynamicArea) {
    dynamicArea = document.createElement("div");
    dynamicArea.id = "dynamicStickerLibraryArea";
    dynamicArea.className = "dynamic-sticker-library-area";

    const buttonParent = useSelectedStickerBtn
      ? useSelectedStickerBtn.parentElement
      : null;

    if (buttonParent && buttonParent.parentElement) {
      buttonParent.parentElement.insertBefore(dynamicArea, buttonParent);
    } else {
      stickerLibraryModal.appendChild(dynamicArea);
    }
  }

  dynamicArea.innerHTML = "";

  libraryStatusEl = document.createElement("div");
  libraryStatusEl.className = "library-status";

  libraryCarouselEl = document.createElement("div");
  libraryCarouselEl.className = "library-principles-carousel";
  libraryCarouselEl.setAttribute("aria-label", "Princípios");

  libraryImagesEl = document.createElement("div");
  libraryImagesEl.className = "library-images-grid";
  libraryImagesEl.setAttribute("aria-label", "Imagens do princípio selecionado");
  libraryImagesEl.hidden = true;

  dynamicArea.appendChild(libraryStatusEl);
  dynamicArea.appendChild(libraryCarouselEl);
  dynamicArea.appendChild(libraryImagesEl);
}

function getRotatedPrinciplesForCarousel(activePrincipleId) {
  if (!stickerLibraryData.length) return [];

  let activeIndex = stickerLibraryData.findIndex((principle) => {
    return principle.id === activePrincipleId;
  });

  if (activeIndex === -1) {
    activeIndex = 0;
  }

  const startIndex =
    (activeIndex - 2 + stickerLibraryData.length) % stickerLibraryData.length;

  const rotated = [];

  for (let index = 0; index < stickerLibraryData.length; index += 1) {
    const realIndex = (startIndex + index) % stickerLibraryData.length;
    rotated.push(stickerLibraryData[realIndex]);
  }

  return rotated;
}

function syncActivePrincipleFromCarousel() {
  if (!libraryCarouselListEl) return;

  const cards = Array.from(
    libraryCarouselListEl.querySelectorAll(".principle-carousel-card")
  );

  cards.forEach((card) => {
    card.classList.remove("active");
  });

  const activeCard = cards[2];

  if (!activeCard) return;

  activeCard.classList.add("active");

  const principleId = activeCard.dataset.principleId;
  const principle = stickerLibraryData.find((item) => item.id === principleId);

  if (!principle) return;

  setSelectedPrincipleFirstImage(principle);
  updateLibraryPreview();
}

function renderLibraryPrinciples() {
  if (!libraryCarouselEl) return;

  libraryCarouselEl.innerHTML = "";

  if (stickerLibraryData.length === 0) {
    if (libraryStatusEl) {
      libraryStatusEl.textContent = "Nenhum sticker encontrado.";
    }
    return;
  }

  if (!selectedLibraryPrincipleId) {
    selectedLibraryPrincipleId = stickerLibraryData[0].id;
  }

  if (libraryStatusEl) {
    libraryStatusEl.textContent =
      "Use as setas para escolher. Toque na imagem principal para ver variações.";
  }

  const carouselWrap = document.createElement("div");
  carouselWrap.className = "principle-diagonal-carousel";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "principle-carousel-arrow principle-carousel-prev";
  prevBtn.textContent = "‹";
  prevBtn.setAttribute("aria-label", "Princípio anterior");

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "principle-carousel-arrow principle-carousel-next";
  nextBtn.textContent = "›";
  nextBtn.setAttribute("aria-label", "Próximo princípio");

  const stage = document.createElement("div");
  stage.className = "principle-carousel-stage";

  libraryCarouselListEl = document.createElement("div");
  libraryCarouselListEl.className = "principle-carousel-list";

  const rotatedPrinciples = getRotatedPrinciplesForCarousel(
    selectedLibraryPrincipleId
  );

  rotatedPrinciples.forEach((principle) => {
    const firstImage = getFirstImageFromPrinciple(principle);

    const card = document.createElement("button");
    card.type = "button";
    card.className = "principle-carousel-card";
    card.dataset.principleId = principle.id;

    const img = document.createElement("img");
    img.src = firstImage ? firstImage.src : "";
    img.alt = principle.name;
    img.loading = "lazy";
    img.draggable = false;

    const label = document.createElement("span");
    label.textContent = principle.name;

    card.appendChild(img);
    card.appendChild(label);

    card.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const cards = Array.from(
        libraryCarouselListEl.querySelectorAll(".principle-carousel-card")
      );

      const cardIndex = cards.indexOf(card);

      if (cardIndex === 2) {
        showLibraryImages(principle);
        return;
      }

      selectLibraryPrinciple(principle.id, {
        showImages: false
      });
    });

    libraryCarouselListEl.appendChild(card);
  });

  prevBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    moveLibraryPrinciple("previous");
  });

  nextBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    moveLibraryPrinciple("next");
  });

  stage.appendChild(libraryCarouselListEl);

  carouselWrap.appendChild(prevBtn);
  carouselWrap.appendChild(stage);
  carouselWrap.appendChild(nextBtn);

  libraryCarouselEl.appendChild(carouselWrap);

  syncActivePrincipleFromCarousel();
}

function moveLibraryPrinciple(direction) {
  if (!libraryCarouselListEl || libraryCarouselIsMoving) return;

  const cards = libraryCarouselListEl.querySelectorAll(".principle-carousel-card");

  if (cards.length <= 1) return;

  libraryCarouselIsMoving = true;
  hideLibraryImages();

  libraryCarouselListEl.classList.remove("next", "previous");

  if (direction === "next") {
    const lastCard = libraryCarouselListEl.lastElementChild;

    if (lastCard) {
      libraryCarouselListEl.prepend(lastCard);
    }

    libraryCarouselListEl.classList.add("next");
  }

  if (direction === "previous") {
    const firstCard = libraryCarouselListEl.firstElementChild;

    if (firstCard) {
      libraryCarouselListEl.appendChild(firstCard);
    }

    libraryCarouselListEl.classList.add("previous");
  }

  syncActivePrincipleFromCarousel();

  window.setTimeout(() => {
    if (libraryCarouselListEl) {
      libraryCarouselListEl.classList.remove("next", "previous");
    }

    libraryCarouselIsMoving = false;
  }, 460);
}

function renderLibraryImages(principle) {
  if (!libraryImagesEl) return;

  libraryImagesEl.innerHTML = "";

  if (!principle) return;

  principle.images.forEach((image) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "library-image-btn";
    button.dataset.imageId = image.id;

    if (image.id === selectedLibraryImageId) {
      button.classList.add("selected");
    }

    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.name;
    img.loading = "lazy";
    img.draggable = false;

    const label = document.createElement("span");
    label.textContent = image.name;

    button.appendChild(img);
    button.appendChild(label);

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      selectLibraryImage(principle.id, image.id);
    });

    libraryImagesEl.appendChild(button);
  });
}

function selectLibraryPrinciple(principleId, options = {}) {
  const principle = stickerLibraryData.find((item) => item.id === principleId);

  if (!principle) return;

  selectedLibraryPrincipleId = principle.id;
  setSelectedPrincipleFirstImage(principle);

  renderLibraryPrinciples();

  if (options.showImages === true) {
    showLibraryImages(principle);
  } else {
    hideLibraryImages();
  }

  updateLibraryPreview();
}

function selectLibraryImage(principleId, imageId) {
  const principle = stickerLibraryData.find((item) => item.id === principleId);

  if (!principle) return;

  const image = principle.images.find((item) => item.id === imageId);

  if (!image) return;

  selectedLibraryPrincipleId = principle.id;
  selectedLibraryImageId = image.id;
  selectedLibraryStickerSrc = image.src;
  selectedLibraryStickerName = image.name;

  showLibraryImages(principle);
  updateLibraryPreview();
}

function updateLibraryPreview() {
  if (stickerLibraryPreview && selectedLibraryStickerSrc) {
    stickerLibraryPreview.src = selectedLibraryStickerSrc;
    stickerLibraryPreview.alt = selectedLibraryStickerName || "Sticker digital";
  }

  if (stickerLibraryName) {
    stickerLibraryName.textContent = selectedLibraryStickerName || "Sticker";
  }
}

async function initializeStickerLibrary() {
  ensureLibraryDynamicLayout();
  await loadStickerLibraryJson();

  const firstPrinciple = stickerLibraryData[0];

  if (firstPrinciple && firstPrinciple.images.length > 0) {
    selectedLibraryPrincipleId = firstPrinciple.id;
    selectedLibraryImageId = firstPrinciple.images[0].id;
    selectedLibraryStickerSrc = firstPrinciple.images[0].src;
    selectedLibraryStickerName = firstPrinciple.images[0].name;
  }

  renderLibraryPrinciples();
  hideLibraryImages();
  updateLibraryPreview();
}

function openStickerLibrary() {
  if (!stickerLibraryModal) return;

  closeFloatingToolbar();
  closeMobileDrawer();
  closeAdvancedSubmenu();

  stickerLibraryModal.hidden = false;
  stickerLibraryModal.setAttribute("aria-hidden", "false");

  renderLibraryPrinciples();
  hideLibraryImages();
  updateLibraryPreview();
}

function closeStickerLibrary() {
  if (!stickerLibraryModal) return;

  if (document.activeElement && stickerLibraryModal.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  stickerLibraryModal.hidden = true;
  stickerLibraryModal.setAttribute("aria-hidden", "true");
}

function useSelectedStickerFromLibrary() {
  if (!selectedLibraryStickerSrc) {
    alert("Selecione um sticker primeiro.");
    return;
  }

  placeStickerImage(selectedLibraryStickerSrc, selectedLibraryStickerName || "Sticker digital");

  closeStickerLibrary();
  closeMobileDrawer();
  closeAdvancedSubmenu();
  updateGuideGlow();
}

/* =========================
   EXPORTAR / COMPARTIR
========================= */
function waitForImage(imageElement) {
  if (!stickerStepDone) {
    return Promise.resolve();
  }

  if (imageElement.complete && imageElement.naturalWidth > 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    imageElement.onload = resolve;
    imageElement.onerror = reject;
  });
}

async function createExportCanvas() {
  getStickerElements().forEach((item) => item.classList.remove("selected"));

  if (typeof html2canvas === "undefined") {
    alert("A biblioteca de exportação ainda não carregou. Verifique sua internet e tente novamente.");
    throw new Error("html2canvas não carregou");
  }

  if (stickerStepDone) {
    await Promise.all(getStickerElements().map(waitForImage));
  }

  const captureBackground =
    window.getComputedStyle(captureArea).backgroundColor || "#fffdf7";

  const canvas = await html2canvas(captureArea, {
    backgroundColor: captureBackground,
    scale: 2,
    useCORS: true
  });

  return canvas;
}

function downloadCanvas(canvas) {
  const link = document.createElement("a");

  link.download = `${getSafeProjectFileName()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

async function exportImage() {
  try {
    closeAllFloatingPanels();

    const canvas = await createExportCanvas();

    downloadCanvas(canvas);

    return true;
  } catch (error) {
    console.error(error);
    alert("Não foi possível salvar a imagem. Tente carregar outro sticker ou atualizar a página.");

    return false;
  }
}

async function shareImage() {
  try {
    closeAllFloatingPanels();

    const canvas = await createExportCanvas();

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    if (!blob) {
      alert("Não foi possível preparar a imagem para compartilhar.");
      return false;
    }

    const file = new File([blob], `${getSafeProjectFileName()}.png`, {
      type: "image/png"
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Scripture Stickers",
        text: "Imagem criada com Scripture Stickers.",
        files: [file]
      });

      return true;
    }

    downloadCanvas(canvas);
    alert("Este navegador não permite compartilhar diretamente. A imagem foi salva para você compartilhar manualmente.");

    return true;
  } catch (error) {
    console.error(error);
    alert("Não foi possível compartilhar a imagem.");

    return false;
  }
}

/* =========================
   MENÚ MÓVIL
========================= */
function closeMobileDrawer() {
  if (!controlsDrawer) return;

  controlsDrawer.classList.remove("is-open");

  mobilePanelBlocks.forEach((block) => {
    block.classList.remove("is-active");
  });

  floatingToolbarButtons.forEach((button) => {
    if (button.dataset.directAction !== "advanced") {
      button.classList.remove("is-active");
    }
  });
}

function openMobilePanel(panelName) {
  if (!controlsDrawer || !isMobileView()) return;

  closeAdvancedSubmenu();

  mobilePanelBlocks.forEach((block) => {
    block.classList.toggle("is-active", block.dataset.panel === panelName);
  });

  floatingToolbarButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mobilePanel === panelName);
  });

  if (mobileDrawerTitle) {
    mobileDrawerTitle.textContent = mobilePanelTitles[panelName] || "Controles";
  }

  controlsDrawer.classList.add("is-open");
}

function closeAdvancedSubmenu() {
  if (!advancedSubmenu) return;

  advancedSubmenu.classList.remove("is-open");
  advancedSubmenu.setAttribute("aria-hidden", "true");

  floatingToolbarButtons.forEach((button) => {
    if (button.dataset.directAction === "advanced") {
      button.classList.remove("is-active");
    }
  });
}

function openAdvancedSubmenu() {
  if (!advancedSubmenu || !isMobileView()) return;

  closeMobileDrawer();

  advancedSubmenu.classList.add("is-open");
  advancedSubmenu.setAttribute("aria-hidden", "false");

  floatingToolbarButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.directAction === "advanced");
  });
}

function toggleAdvancedSubmenu() {
  if (!advancedSubmenu) return;

  if (advancedSubmenu.classList.contains("is-open")) {
    closeAdvancedSubmenu();
  } else {
    openAdvancedSubmenu();
  }
}

function closeFloatingToolbar() {
  if (!floatingToolbar) return;

  floatingToolbar.classList.remove("is-open");
  floatingToolbar.setAttribute("aria-hidden", "true");

  floatingToolbarButtons.forEach((button) => {
    button.classList.remove("is-active");
  });

  updateStartGlow();
}

function openFloatingToolbar() {
  if (!floatingToolbar || !isMobileView()) return;

  floatingToolbar.classList.add("is-open");
  floatingToolbar.setAttribute("aria-hidden", "false");

  if (mobileMenuTrigger) {
    mobileMenuTrigger.classList.remove("start-glow");
  }
}

function toggleFloatingToolbar() {
  if (!floatingToolbar) return;

  if (floatingToolbar.classList.contains("is-open")) {
    closeFloatingToolbar();
    closeMobileDrawer();
    closeAdvancedSubmenu();
  } else {
    openFloatingToolbar();
  }
}

function closeAllFloatingPanels() {
  closeMobileDrawer();
  closeAdvancedSubmenu();
  closeFloatingToolbar();
}

function clearLongPressTimer() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

/* =========================
   EVENTOS
========================= */
applyTextBtn.addEventListener("click", () => {
  applyText();

  if (isMobileView()) {
    closeMobileDrawer();
  }
});

if (materialImportBtn && materialImportInput) {
  materialImportBtn.addEventListener("click", () => {
    materialImportInput.click();
  });

  materialImportInput.addEventListener("change", importMaterialFile);
}

scriptureInput.addEventListener("input", () => {
  setMaterialImportStatus();

  if (scriptureInput.value.trim().length === 0) {
    scriptureText.textContent = "";
    textStepDone = false;
    resetWorkflowAfterTextChange();
    stickerLocked = false;
    hideSticker();
  } else {
    textStepDone = false;
    projectStepDone = false;
    exportStepDone = false;
    shareStepDone = false;
  }

  updateGuideGlow();
});

projectNameInput.addEventListener("input", () => {
  projectStepDone = false;
  exportStepDone = false;
  shareStepDone = false;
});

if (stickerUploadBtn && stickerUpload) {
  stickerUploadBtn.addEventListener("click", () => {
    if (!canAddSticker()) {
      showStickerLimitNotice();
      updateStickerCounter();
      return;
    }

    stickerUpload.click();
  });
}

stickerUpload.addEventListener("change", loadStickerFromFile);

if (openStickerLibraryBtn) {
  openStickerLibraryBtn.addEventListener("click", openStickerLibrary);
}

if (closeStickerLibraryBtn) {
  closeStickerLibraryBtn.addEventListener("click", closeStickerLibrary);
}

if (useSelectedStickerBtn) {
  useSelectedStickerBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    useSelectedStickerFromLibrary();
  });
}

if (stickerLibraryModal) {
  stickerLibraryModal.addEventListener("click", (event) => {
    if (event.target === stickerLibraryModal) {
      closeStickerLibrary();
    }
  });
}

setupStickerElement(sticker);
updateStickerCounter();

resetStickerBtn.addEventListener("click", () => {
  centerSticker();
  flashCenteredSticker();
  projectStepDone = false;
  exportStepDone = false;
  shareStepDone = false;
  updateGuideGlow();

  if (isMobileView()) {
    closeMobileDrawer();
  }
});

newProjectBtn.addEventListener("click", newProject);
saveProjectBtn.addEventListener("click", saveProject);
loadProjectBtn.addEventListener("click", () => loadProject(true));
exportProjectBtn.addEventListener("click", exportProjectFile);
importProjectBtn.addEventListener("click", () => importProjectInput.click());
importProjectInput.addEventListener("change", importProjectFile);

backgroundSelect.addEventListener("change", () => {
  applyBackground(true);
});

opacityRange.addEventListener("input", () => {
  updateOpacity(true);
});

sizeRange.addEventListener("input", () => {
  updateSize(true);
});

sizeRange.addEventListener("change", () => {
  if (isMobileView()) {
    closeMobileDrawer();
  }
});

edgeSoftnessRange.addEventListener("input", () => {
  updateStickerEffects(true);
});

colorBoostRange.addEventListener("input", () => {
  updateStickerEffects(true);
});

exportBtn.addEventListener("click", async () => {
  const exported = await exportImage();

  if (exported) {
    exportStepDone = true;
    updateGuideGlow();
  }
});

shareBtn.addEventListener("click", async () => {
  const shared = await shareImage();

  if (shared) {
    shareStepDone = true;
    updateGuideGlow();
  }
});

if (mobileMenuTrigger) {
  mobileMenuTrigger.addEventListener("click", () => {
    toggleFloatingToolbar();
  });
}

floatingToolbarButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const panelName = button.dataset.mobilePanel;
    const directAction = button.dataset.directAction;

    if (panelName) {
      openMobilePanel(panelName);
      return;
    }

    if (directAction === "center") {
      centerSticker();
      flashCenteredSticker();
      sizeStepDone = true;
      projectStepDone = false;
      exportStepDone = false;
      shareStepDone = false;
      closeMobileDrawer();
      closeAdvancedSubmenu();
      updateGuideGlow();
      return;
    }

    if (directAction === "advanced") {
      toggleAdvancedSubmenu();
      return;
    }

    if (directAction === "save") {
      exportBtn.click();
      return;
    }

    if (directAction === "share") {
      shareBtn.click();
      return;
    }

    if (directAction === "close") {
      closeAllFloatingPanels();
    }
  });
});

if (closeDrawerBtn) {
  closeDrawerBtn.addEventListener("click", () => {
    closeMobileDrawer();
  });
}

captureArea.addEventListener("click", (event) => {
  if (!isMobileView()) return;
  if (stickerLibraryModal && !stickerLibraryModal.hidden) return;
  if (event.target.classList && event.target.classList.contains("sticker")) return;

  openFloatingToolbar();
});

captureArea.addEventListener("pointerdown", (event) => {
  if (!isMobileView()) return;

  longPressStartX = event.clientX;
  longPressStartY = event.clientY;

  clearLongPressTimer();

  longPressTimer = setTimeout(() => {
    openFloatingToolbar();
  }, 1000);
});

captureArea.addEventListener("pointermove", (event) => {
  if (!longPressTimer) return;

  const moveX = Math.abs(event.clientX - longPressStartX);
  const moveY = Math.abs(event.clientY - longPressStartY);

  if (moveX > 10 || moveY > 10) {
    clearLongPressTimer();
  }
});

captureArea.addEventListener("pointerup", () => {
  clearLongPressTimer();
});

captureArea.addEventListener("pointercancel", () => {
  clearLongPressTimer();
});

document.addEventListener("click", (event) => {
  if (!event.target.classList || !event.target.classList.contains("sticker")) {
    getStickerElements().forEach((item) => item.classList.remove("selected"));
  }

  if (!isMobileView()) return;

  const clickedToolbar = floatingToolbar && floatingToolbar.contains(event.target);
  const clickedDrawer = controlsDrawer && controlsDrawer.contains(event.target);
  const clickedAdvanced = advancedSubmenu && advancedSubmenu.contains(event.target);
  const clickedTrigger = mobileMenuTrigger && mobileMenuTrigger.contains(event.target);
  const clickedLibrary = stickerLibraryModal && stickerLibraryModal.contains(event.target);

  if (
    !clickedToolbar &&
    !clickedDrawer &&
    !clickedAdvanced &&
    !clickedTrigger &&
    !clickedLibrary
  ) {
    closeMobileDrawer();
    closeAdvancedSubmenu();
  }
});

window.addEventListener("resize", () => {
  if (!isMobileView()) {
    closeAllFloatingPanels();
  }

  updateStartGlow();
});

/* =========================
   INICIO
========================= */
window.addEventListener("load", async () => {
  setupStickerElement(sticker);

  hideSticker();

  opacityRange.value = AUTO_OPACITY;
  edgeSoftnessRange.value = AUTO_EDGE_SOFTNESS;
  colorBoostRange.value = AUTO_COLOR_BOOST;

  updateOpacity(false);
  updateSize(false);
  applyBackground(false);
  updateStickerEffects(false);

  await initializeStickerLibrary();

  const projectWasOpened = loadProject(false);

  if (!projectWasOpened) {
    applyText();
    centerSticker();
    updateGuideGlow();
  }
});