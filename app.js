const scriptureInput = document.getElementById("scriptureInput");
const applyTextBtn = document.getElementById("applyTextBtn");
const scriptureText = document.getElementById("scriptureText");
const sticker = document.getElementById("sticker");
const stickerUpload = document.getElementById("stickerUpload");

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
const stickerLibraryItems = document.querySelectorAll(".sticker-library-item");

const AUTO_OPACITY = "30";
const AUTO_EDGE_SOFTNESS = "6";
const AUTO_COLOR_BOOST = "120";
const STICKER_DOUBLE_TAP_DELAY = 350;
const STICKER_DOUBLE_TAP_DISTANCE = 28;
const STICKER_DRAG_START_DISTANCE = 6;
let textStepDone = false;
let stickerStepDone = false;
let backgroundStepDone = false;
let opacityStepDone = false;
let sizeStepDone = false;
let edgeStepDone = false;
let colorStepDone = false;
let projectStepDone = false;
let exportStepDone = false;
let shareStepDone = false;

let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

let longPressTimer = null;
let longPressStartX = 0;
let longPressStartY = 0;

let selectedLibraryStickerSrc = "stickers/arrependimento.png";
let selectedLibraryStickerName = "Arrependimento";

let stickerLocked = false;
let lastStickerTapTime = 0;
let lastStickerTapX = 0;
let lastStickerTapY = 0;
let activeStickerPointerId = null;
let pendingUnlockedPointer = null;
let pendingUnlockedPointerId = null;
const mobilePanelTitles = {
  text: "Texto",
  sticker: "Sticker",
  size: "Tamanho",
  actions: "Ações"
};

function isMobileView() {
  return window.matchMedia("(max-width: 850px)").matches;
}

function clearGuideGlow() {
  document.querySelectorAll(".guided-glow").forEach((item) => {
    item.classList.remove("guided-glow");
  });
}

function hideSticker() {
  sticker.style.display = "none";
  sticker.classList.remove("selected");
}

function showSticker() {
  sticker.style.display = "block";
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
  backgroundStepDone = false;
  opacityStepDone = false;
  sizeStepDone = false;
  edgeStepDone = false;
  colorStepDone = false;
  projectStepDone = false;
  exportStepDone = false;
  shareStepDone = false;
}

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

function updateOpacity(markStep = true) {
  const value = Number(opacityRange.value);

  sticker.style.opacity = value / 100;
  opacityValue.textContent = `${value}%`;

  if (markStep) {
    opacityStepDone = true;
    projectStepDone = false;
    exportStepDone = false;
    shareStepDone = false;
    updateGuideGlow();
  }
}

function updateSize(markStep = true) {
  const value = Number(sizeRange.value);

  sticker.style.width = `${value}px`;
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
    backgroundStepDone = true;
    projectStepDone = false;
    exportStepDone = false;
    shareStepDone = false;
    updateGuideGlow();
  }
}

function updateStickerEffects(markEdgeStep = false, markColorStep = false) {
  const edge = Number(edgeSoftnessRange.value);
  const colorBoost = Number(colorBoostRange.value);

  edgeSoftnessValue.textContent = `${edge} px`;
  colorBoostValue.textContent = `${colorBoost}%`;

  sticker.style.filter = `saturate(${colorBoost}%) contrast(105%)`;

  if (edge > 0) {
    const mask = `
      linear-gradient(to right, transparent 0px, black ${edge}px, black calc(100% - ${edge}px), transparent 100%),
      linear-gradient(to bottom, transparent 0px, black ${edge}px, black calc(100% - ${edge}px), transparent 100%)
    `;

    sticker.style.webkitMaskImage = mask;
    sticker.style.maskImage = mask;
    sticker.style.webkitMaskSize = "100% 100%";
    sticker.style.maskSize = "100% 100%";
    sticker.style.webkitMaskRepeat = "no-repeat";
    sticker.style.maskRepeat = "no-repeat";
    sticker.style.webkitMaskComposite = "source-in";
    sticker.style.maskComposite = "intersect";
  } else {
    sticker.style.webkitMaskImage = "none";
    sticker.style.maskImage = "none";
    sticker.style.webkitMaskComposite = "";
    sticker.style.maskComposite = "";
  }

  if (markEdgeStep) edgeStepDone = true;
  if (markColorStep) colorStepDone = true;

  if (markEdgeStep || markColorStep) {
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
  updateStickerEffects(false, false);

  opacityStepDone = true;
  edgeStepDone = true;
  colorStepDone = true;
}

function centerSticker() {
  const pageRect = captureArea.getBoundingClientRect();
  const stickerWidth = sticker.offsetWidth || Number(sizeRange.value);

  sticker.style.left = `${(pageRect.width - stickerWidth) / 2}px`;
  sticker.style.top = `${pageRect.height * 0.48}px`;
}

function flashCenteredSticker() {
  sticker.classList.add("center-flash");

  setTimeout(() => {
    sticker.classList.remove("center-flash");
  }, 650);
}

function getPointerPosition(event) {
  const point = event.touches ? event.touches[0] : event;

  return {
    x: point.clientX,
    y: point.clientY
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

  if (event.pointerId !== undefined && sticker.setPointerCapture) {
    try {
      sticker.setPointerCapture(event.pointerId);
    } catch (error) {
      // Alguns navegadores podem falhar se o ponteiro já foi liberado.
    }
  }
}

function releaseStickerPointer(event) {
  if (event && event.pointerId !== undefined && sticker.releasePointerCapture) {
    try {
      sticker.releasePointerCapture(event.pointerId);
    } catch (error) {
      // Ignora quando o navegador já liberou o ponteiro.
    }
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

  if (isDoubleTap) {
    resetStickerDoubleTapState();
  }

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
  sticker.classList.add("selected");
}
function beginStickerDrag(pointer) {
  sticker.classList.add("selected");

  const stickerRect = sticker.getBoundingClientRect();

  isDragging = true;
  dragOffsetX = pointer.x - stickerRect.left;
  dragOffsetY = pointer.y - stickerRect.top;

  window.addEventListener("pointermove", drag, { passive: false });
  window.addEventListener("pointerup", stopDrag);
  window.addEventListener("pointercancel", stopDrag);
}

function startDrag(event) {
  if (!stickerStepDone) return;

  event.preventDefault();
  event.stopPropagation();
  clearPendingStickerUnlockEvents();

  const pointer = getPointerPosition(event);

  if (stickerLocked) {
    if (!isStickerDoubleTap(pointer)) return;

    stickerLocked = false;
    captureStickerPointer(event);
    beginStickerDrag(pointer);
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

  const maxLeft = captureArea.clientWidth - sticker.offsetWidth;
  const maxTop = captureArea.clientHeight - sticker.offsetHeight;

  newLeft = Math.max(0, Math.min(newLeft, maxLeft));
  newTop = Math.max(0, Math.min(newTop, maxTop));

  sticker.style.left = `${newLeft}px`;
  sticker.style.top = `${newTop}px`;

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

  isDragging = false;
  stickerLocked = true;
  sticker.classList.remove("selected");

  window.removeEventListener("pointermove", drag);
  window.removeEventListener("pointerup", stopDrag);
  window.removeEventListener("pointercancel", stopDrag);

  resetStickerDoubleTapState();
  releaseStickerPointer(event);

  updateGuideGlow();
}

function getSafeProjectFileName() {
  const typedName = projectNameInput.value.trim();

  if (!typedName) {
    return "scripture-sticker";
  }

  const safeName = typedName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safeName || "scripture-sticker";
}

function getProjectData() {
  return {
    projectName: projectNameInput.value.trim(),
    text: scriptureInput.value,
    stickerSrc: stickerStepDone ? sticker.getAttribute("src") || sticker.src : "",
    stickerLeft: sticker.style.left,
    stickerTop: sticker.style.top,
    stickerWidth: sticker.style.width,
    stickerOpacity: sticker.style.opacity,
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

  if (projectData.stickerSrc) {
    sticker.src = projectData.stickerSrc;
    showSticker();
    stickerStepDone = true;
    stickerLocked = true;
  } else {
    sticker.removeAttribute("src");
    hideSticker();
    stickerStepDone = false;
    stickerLocked = false;
  }

  sticker.style.left = projectData.stickerLeft || "110px";
  sticker.style.top = projectData.stickerTop || "330px";
  sticker.style.width = projectData.stickerWidth || "210px";
  sticker.style.opacity = projectData.stickerOpacity || "0.30";

  opacityRange.value = projectData.opacityRangeValue || AUTO_OPACITY;
  sizeRange.value = projectData.sizeRangeValue || "210";
  backgroundSelect.value = projectData.backgroundValue || "white";
  edgeSoftnessRange.value = projectData.edgeSoftnessValue || AUTO_EDGE_SOFTNESS;
  colorBoostRange.value = projectData.colorBoostValue || AUTO_COLOR_BOOST;

  updateOpacity(false);
  updateSize(false);
  applyBackground(false);
  updateStickerEffects(false, false);

  textStepDone = scriptureInput.value.trim().length > 0;
  backgroundStepDone = true;
  opacityStepDone = true;
  sizeStepDone = true;
  edgeStepDone = true;
  colorStepDone = true;
  projectStepDone = markAsSaved;
  exportStepDone = false;
  shareStepDone = false;

  updateGuideGlow();
}

function saveProject() {
  const projectData = getProjectData();

  localStorage.setItem("scriptureStickersProject", JSON.stringify(projectData));

  projectStepDone = true;
  updateGuideGlow();

  alert("Projeto guardado neste navegador.");
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
  updateStickerEffects(false, false);
  centerSticker();

  textStepDone = false;
  stickerStepDone = false;
  stickerLocked = false;
  backgroundStepDone = false;
  opacityStepDone = false;
  sizeStepDone = false;
  edgeStepDone = false;
  colorStepDone = false;
  projectStepDone = false;
  exportStepDone = false;
  shareStepDone = false;

  closeAllFloatingPanels();
  closeStickerLibrary();
  updateGuideGlow();
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

function loadStickerFromFile(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (loadEvent) {
    sticker.src = loadEvent.target.result;
    showSticker();
    centerSticker();
    applyAutomaticStickerSettings();

    stickerStepDone = true;
    stickerLocked = false;
    sizeStepDone = false;
    projectStepDone = false;
    exportStepDone = false;
    shareStepDone = false;

    closeMobileDrawer();
    closeAdvancedSubmenu();
    updateGuideGlow();
  };

  reader.readAsDataURL(file);
}

function openStickerLibrary() {
  if (!stickerLibraryModal) return;

  closeFloatingToolbar();
  closeMobileDrawer();
  closeAdvancedSubmenu();

  stickerLibraryModal.hidden = false;
  stickerLibraryModal.setAttribute("aria-hidden", "false");
}

function closeStickerLibrary() {
  if (!stickerLibraryModal) return;

  stickerLibraryModal.hidden = true;
  stickerLibraryModal.setAttribute("aria-hidden", "true");
}

function selectStickerFromLibrary(item) {
  if (!item) return;

  selectedLibraryStickerSrc = item.dataset.stickerSrc || "";
  selectedLibraryStickerName = item.dataset.stickerName || "Sticker";

  stickerLibraryItems.forEach((libraryItem) => {
    libraryItem.classList.toggle("selected", libraryItem === item);
  });

  if (stickerLibraryPreview) {
    stickerLibraryPreview.src = selectedLibraryStickerSrc;
  }

  if (stickerLibraryName) {
    stickerLibraryName.textContent = selectedLibraryStickerName;
  }
}

function useSelectedStickerFromLibrary() {
  if (!selectedLibraryStickerSrc) return;

  sticker.src = selectedLibraryStickerSrc;
  sticker.alt = selectedLibraryStickerName || "Sticker digital";

  showSticker();
  centerSticker();
  applyAutomaticStickerSettings();

  stickerStepDone = true;
  stickerLocked = false;
  sizeStepDone = false;
  projectStepDone = false;
  exportStepDone = false;
  shareStepDone = false;

  closeStickerLibrary();
  closeMobileDrawer();
  closeAdvancedSubmenu();
  updateGuideGlow();
}

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
  sticker.classList.remove("selected");

  if (typeof html2canvas === "undefined") {
    alert("A biblioteca de exportação ainda não carregou. Verifique sua internet e tente novamente.");
    throw new Error("html2canvas não carregou");
  }

  if (stickerStepDone) {
    await waitForImage(sticker);
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

applyTextBtn.addEventListener("click", () => {
  applyText();

  if (isMobileView()) {
    closeMobileDrawer();
  }
});

scriptureInput.addEventListener("input", () => {
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

stickerUpload.addEventListener("change", loadStickerFromFile);

if (openStickerLibraryBtn) {
  openStickerLibraryBtn.addEventListener("click", openStickerLibrary);
}

if (closeStickerLibraryBtn) {
  closeStickerLibraryBtn.addEventListener("click", closeStickerLibrary);
}

if (useSelectedStickerBtn) {
  useSelectedStickerBtn.addEventListener("click", useSelectedStickerFromLibrary);
}

stickerLibraryItems.forEach((item) => {
  item.addEventListener("click", () => {
    selectStickerFromLibrary(item);
  });
});

if (stickerLibraryModal) {
  stickerLibraryModal.addEventListener("click", (event) => {
    if (event.target === stickerLibraryModal) {
      closeStickerLibrary();
    }
  });
}

sticker.addEventListener("pointerdown", startDrag, { passive: false });

sticker.addEventListener("dragstart", (event) => {
  event.preventDefault();
});

sticker.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

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
  updateStickerEffects(true, false);
});

colorBoostRange.addEventListener("input", () => {
  updateStickerEffects(false, true);
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
  if (event.target !== sticker) {
    sticker.classList.remove("selected");
  }

  if (!isMobileView()) return;

  const clickedToolbar = floatingToolbar && floatingToolbar.contains(event.target);
  const clickedDrawer = controlsDrawer && controlsDrawer.contains(event.target);
  const clickedAdvanced = advancedSubmenu && advancedSubmenu.contains(event.target);
  const clickedTrigger = mobileMenuTrigger && mobileMenuTrigger.contains(event.target);
  const clickedLibrary = stickerLibraryModal && stickerLibraryModal.contains(event.target);

  if (!clickedToolbar && !clickedDrawer && !clickedAdvanced && !clickedTrigger && !clickedLibrary) {
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

window.addEventListener("load", () => {
  const firstLibraryItem =
    document.querySelector(".sticker-library-item.selected") ||
    document.querySelector(".sticker-library-item");

  if (firstLibraryItem) {
    selectStickerFromLibrary(firstLibraryItem);
  }

  sticker.setAttribute("draggable", "false");
  sticker.style.touchAction = "none";
  sticker.style.userSelect = "none";
  sticker.style.webkitUserDrag = "none";

  hideSticker();

  opacityRange.value = AUTO_OPACITY;
  edgeSoftnessRange.value = AUTO_EDGE_SOFTNESS;
  colorBoostRange.value = AUTO_COLOR_BOOST;

  updateOpacity(false);
  updateSize(false);
  applyBackground(false);
  updateStickerEffects(false, false);

  const projectWasOpened = loadProject(false);

  if (!projectWasOpened) {
    applyText();
    centerSticker();
    updateGuideGlow();
  }
});
