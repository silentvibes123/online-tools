// ===== INIT =====
// TOOL COUNT — update this single number when new tools are added
const TOOL_COUNT = 23;

const VALID_TOOLS = ["cash","resizer","age","pdf","compress","qrcode","pdfToImg","merge","split","pdfToWord","gst","removePages","wordCounter","password","base64","unitConverter","loremIpsum","emi","imageToText","percentage","caseConverter","stopwatch"];

const TOOL_LABELS = {
  cash:"Cash Counter", resizer:"Exam Resizer", age:"Age Calc", pdf:"Images→PDF",
  compress:"Compressor", qrcode:"QR Code", pdfToImg:"PDF→Image",
  merge:"Merge PDF", split:"Split PDF", pdfToWord:"PDF→Text",
  gst:"GST Calc", removePages:"Remove Pages", wordCounter:"Word Counter",
  password:"Password Gen", base64:"Base64", unitConverter:"Unit Conv", loremIpsum:"Lorem Ipsum",
  emi:"EMI Calc", imageToText:"Image→Text", percentage:"% Calc", caseConverter:"Case Conv", stopwatch:"Stopwatch"
};
const TOOL_ICONS = {
  cash:"fas fa-calculator", resizer:"fas fa-id-card", age:"fas fa-birthday-cake",
  pdf:"fas fa-file-pdf", compress:"fas fa-compress-arrows-alt", qrcode:"fas fa-qrcode",
  pdfToImg:"fas fa-images", merge:"fas fa-object-group",
  split:"fas fa-cut", pdfToWord:"fas fa-file-alt",
  gst:"fas fa-file-invoice-dollar", removePages:"fas fa-file-signature",
  wordCounter:"fas fa-font", password:"fas fa-key", base64:"fas fa-code",
  unitConverter:"fas fa-ruler-combined", loremIpsum:"fas fa-align-left",
  emi:"fas fa-home", imageToText:"fas fa-camera", percentage:"fas fa-percent",
  caseConverter:"fas fa-text-height", stopwatch:"fas fa-stopwatch"
};

function saveRecent(name) {
  let recent = JSON.parse(localStorage.getItem("stp_recent") || "[]");
  recent = [name, ...recent.filter(t => t !== name)].slice(0, 5);
  localStorage.setItem("stp_recent", JSON.stringify(recent));
}

function renderRecentBar() {
  const recent = JSON.parse(localStorage.getItem("stp_recent") || "[]");
  const bar = document.getElementById("recentBar");
  const chips = document.getElementById("recentChips");
  if (!bar || !chips || recent.length === 0) return;
  chips.innerHTML = recent.map(t =>
    `<span class="recent-chip" onclick="openTool('${t}')"><i class="${TOOL_ICONS[t]||'fas fa-tools'} me-1"></i>${TOOL_LABELS[t]||t}</span>`
  ).join("");
  bar.classList.remove("d-none");
}

window.addEventListener("load", () => {
  if (typeof pdfjsLib !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
  }
  const path = location.pathname.replace(/^\//, "").replace(/\/$/, "");
  if (VALID_TOOLS.includes(path)) openTool(path);
  else { updateDynamicTitle(null); renderRecentBar(); }
  const btn = document.getElementById("scrollTopBtn");
  if (btn) window.addEventListener("scroll", () => btn.classList.toggle("visible", window.scrollY > 400));
});

window.addEventListener("popstate", (e) => {
  if (e.state && e.state.tool) openTool(e.state.tool);
  else if (e.state && e.state.page) showExtra(e.state.page);
  else goToDashboard();
});

// ===== NOTIFY =====
function showNotify(type, msg) {
  if (type === "success") Swal.fire({icon:"success",title:"Done!",text:msg,confirmButtonColor:"#4f46e5"});
  else if (type === "error") Swal.fire({icon:"error",title:"Error",text:msg,confirmButtonColor:"#dc3545"});
  else Swal.mixin({toast:true,position:"top-end",showConfirmButton:false,timer:3000,timerProgressBar:true}).fire({icon:"info",title:msg});
}

// ===== TITLE UPDATE =====
const TOOL_META = {
  cash:["Online Cash Counter & Denomination Calculator | onlineTools","Calculate total cash with Indian currency denominations. Print professional receipts."],
  resizer:["Exam Photo Resizer (20KB-50KB) for SSC, UPSC, Bank | onlineTools","Resize photos for SSC, UPSC, IBPS exams. Compress to 20KB/50KB without quality loss."],
  age:["Accurate Age Calculator by Date of Birth | onlineTools","Calculate exact age in years, months, days. Perfect for govt job forms."],
  pdf:["Images to PDF Converter | onlineTools","Convert JPG, PNG, WEBP images into a single PDF instantly."],
  compress:["Compress Image to 20KB & 50KB Online | onlineTools","Reduce image file size without losing clarity. Best for exam portals."],
  qrcode:["Free QR Code Generator | onlineTools","Create custom QR codes for URL, text, UPI. Instant download."],
  pdfToImg:["PDF to Image Converter Online | onlineTools","Convert PDF pages into high-quality JPEG images securely."],
  merge:["Merge PDF Files Online | onlineTools","Combine multiple PDFs into one file securely."],
  split:["Split PDF Pages Online | onlineTools","Extract specific pages from PDF instantly."],
  gst:["GST Calculator India - Add/Remove GST | onlineTools","Calculate GST with CGST/SGST split. Free Indian GST tool."],
  removePages:["Remove PDF Pages Online | onlineTools","Delete specific pages from PDF with visual preview."],
  pdfToWord:["PDF to Text Extractor Online | onlineTools","Extract and edit text from any PDF file in your browser."],
  wordCounter:["Word Counter & Text Analyzer Online | onlineTools","Count words, characters, sentences and reading time instantly."],
  password:["Strong Password Generator | onlineTools","Generate secure random passwords with custom length and symbols."],
  base64:["Base64 Encoder & Decoder Online | onlineTools","Encode or decode Base64 text instantly in your browser."],
  unitConverter:["Unit Converter | onlineTools","Convert units of length, weight, temperature, area and speed."],
  loremIpsum:["Lorem Ipsum Generator | onlineTools","Generate Lorem Ipsum dummy text by words, sentences or paragraphs."],
  emi:["EMI Calculator — Home, Car & Personal Loan | onlineTools","Calculate monthly EMI for home loan, car loan, personal loan."],
  imageToText:["Image to Text Converter (OCR) | onlineTools","Extract text from any image or photo instantly."],
  percentage:["Percentage Calculator | onlineTools","Calculate percentage, marks percentage, discount. Free & instant."],
  caseConverter:["Text Case Converter | onlineTools","Convert text to UPPERCASE, lowercase, Title Case, camelCase instantly."],
  stopwatch:["Online Stopwatch & Countdown Timer | onlineTools","Free online stopwatch with lap times and countdown timer."],
};

function updateDynamicTitle(tool) {
  const meta = TOOL_META[tool];
  document.title = meta ? meta[0] : "onlineTools - Free Online Digital Toolkit";
  const tag = document.querySelector('meta[name="description"]');
  if (tag) tag.setAttribute("content", meta ? meta[1] : "Free online tools: image resizer, PDF tools, GST calculator. 100% browser-based.");
}

// ===== NAVIGATION =====
function openTool(name) {
  ["toolsGrid","heroSection","statsSection","extraScreens","seoContent"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("d-none");
  });
  const activeTool = document.getElementById("activeTool");
  const toolUI = document.getElementById("toolUI");
  if (activeTool) { activeTool.classList.remove("d-none"); activeTool.removeAttribute("style"); }
  if (location.pathname !== "/" + name) history.pushState({tool:name}, "", "/" + name);
  updateDynamicTitle(name);
  saveRecent(name);
  const canonical = document.getElementById("canonicalTag");
  if (canonical) canonical.setAttribute("href", "https://ilovefasttools.in/" + name);
  if (toolUI) { toolUI.innerHTML = ""; renderToolContent(name, toolUI); }
  // Scroll to top of tool after render, not before
  requestAnimationFrame(() => {
    const activeTool = document.getElementById("activeTool");
    if (activeTool) activeTool.scrollIntoView({behavior:"smooth", block:"start"});
  });
}

function goToDashboard() {
  const activeTool = document.getElementById("activeTool");
  const extraScreens = document.getElementById("extraScreens");
  const toolUI = document.getElementById("toolUI");
  if (activeTool) { activeTool.classList.add("d-none"); activeTool.removeAttribute("style"); }
  if (extraScreens) { extraScreens.classList.add("d-none"); extraScreens.removeAttribute("style"); }
  if (toolUI) toolUI.innerHTML = "";
  ["toolsGrid","heroSection","statsSection","seoContent"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("d-none");
  });
  history.pushState({}, "", "/");
  updateDynamicTitle(null);
  renderRecentBar();
}

function showDashboard() { goToDashboard(); window.scrollTo(0,0); }
function goBack() { goToDashboard(); }

function filterByCategory(cat, el) {
  document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
  el.classList.add("active");
  document.querySelectorAll(".tool-item").forEach(item => {
    item.style.display = (cat === "all" || item.dataset.cat === cat) ? "" : "none";
  });
  // Show/hide category boxes based on filter
  document.querySelectorAll(".cat-box").forEach(box => {
    if (cat === "all") { box.style.display = ""; return; }
    const visible = Array.from(box.querySelectorAll(".tool-item")).some(i => i.style.display !== "none");
    box.style.display = visible ? "" : "none";
  });
}

function filterTools() {
  const q = document.getElementById("toolSearch").value.toLowerCase().trim();
  if (!q) {
    // Restore all
    document.querySelectorAll(".tool-item").forEach(i => i.style.display = "");
    document.querySelectorAll(".cat-box").forEach(b => b.style.display = "");
    return;
  }
  let found = 0;
  document.querySelectorAll(".tool-item").forEach(item => {
    const match = item.dataset.search.includes(q) || item.querySelector("h6").innerText.toLowerCase().includes(q);
    item.style.display = match ? "" : "none";
    if (match) found++;
  });
  // Hide empty category boxes
  document.querySelectorAll(".cat-box").forEach(box => {
    const visible = Array.from(box.querySelectorAll(".tool-item")).some(i => i.style.display !== "none");
    box.style.display = visible ? "" : "none";
  });
}

// ===== HELPERS =====
const PRIVACY = `<div class="privacy-badge mt-3 mb-1"><i class="fas fa-shield-halved me-1"></i>100% Private — Files never leave your browser</div>`;
const BACK = `<div class="mb-4"><button class="btn btn-sm btn-light border shadow-sm px-3 rounded-pill" onclick="goToDashboard()"><i class="fas fa-arrow-left me-2 text-primary"></i>Back to Tools</button></div>`;

// Info box shown inside each tool — what it does + example
function infoBox(what, example) {
  return `<div class="d-flex gap-3 p-3 rounded-3 mb-3" style="background:#f8f7ff;border:1px solid #e0e7ff">
    <i class="fas fa-circle-info text-primary mt-1" style="flex-shrink:0"></i>
    <div>
      <div class="small fw-bold text-primary mb-1">What this tool does</div>
      <div class="small text-muted mb-2">${what}</div>
      <div class="small fw-bold text-success mb-1"><i class="fas fa-lightbulb me-1"></i>Example</div>
      <div class="small text-muted font-monospace" style="background:#f0fdf4;padding:6px 10px;border-radius:6px;border-left:3px solid #16a34a">${example}</div>
    </div>
  </div>`;
}

function seoBlock(icon, color, title, paras) {
  return `<div class="mt-4 p-4 bg-white rounded-3 border shadow-sm">
    <h2 class="h5 fw-bold mb-3" style="color:${color}"><i class="${icon} me-2"></i>${title}</h2>
    ${paras.map(p=>`<p class="small text-muted mb-2">${p}</p>`).join("")}
  </div>`;
}

// ===== RENDER TOOL CONTENT =====
function renderToolContent(name, container) {
  const tpl = {

    cash: `${BACK}
      ${infoBox("Count Indian currency notes denomination-wise and get the total amount instantly. Enter how many notes you have of each denomination.", "₹500 × 5 notes = ₹2500<br>₹100 × 3 notes = ₹300<br><strong>Total = ₹2800</strong>")}
      <div class="tool-header"><h3><i class="fas fa-calculator me-2 text-success"></i>Cash Counter</h3><button class="btn btn-sm btn-outline-danger rounded-pill" onclick="resetCash()"><i class="fas fa-redo me-1"></i>Reset</button></div>
      <div class="row g-3 mt-1">
        <div class="col-md-7"><div class="tool-panel">${[2000,500,200,100,50,20,10,5,2,1].map(n=>`<div class="denom-row"><span class="denom-label">₹${n}</span><input type="number" class="form-control input-premium flex-fill" id="note-${n}" oninput="calcCash()" placeholder="0" min="0"><span class="denom-result" id="res-${n}">₹0</span></div>`).join("")}</div></div>
        <div class="col-md-5"><div class="total-box"><div class="total-label">Total Amount</div><div class="total-amount">₹<span id="grandTotal">0</span></div><button class="btn btn-light fw-bold rounded-pill px-4 mt-3" onclick="handlePrint()"><i class="fas fa-print me-2 text-primary"></i>Print Receipt</button></div></div>
      </div>${PRIVACY}
      ${seoBlock("fas fa-info-circle","#16a34a","About Cash Counter",["Count Indian currency notes denomination-wise — ₹2000, ₹500, ₹200, ₹100, ₹50, ₹20, ₹10, ₹5, ₹2, and ₹1. Ideal for shopkeepers, accountants and bank staff.","Enter the count for each note and get the grand total instantly. Print a professional cash receipt directly from the browser."])}`,

    pdf: `${BACK}
      ${infoBox("Convert multiple JPG, PNG, or WEBP images into a single PDF file — useful for submitting scanned documents on govt portals.", "3 photos of your marksheet → select all 3 → click Generate → one PDF file ready to upload")}
      <div class="tool-header"><h3><i class="fas fa-file-pdf me-2 text-danger"></i>Images to PDF</h3><button class="btn btn-sm btn-outline-danger rounded-pill" onclick="resetPDFTool()"><i class="fas fa-trash me-1"></i>Clear</button></div>
      <div class="upload-zone mt-3" onclick="document.getElementById('imageInput').click()">
        <div class="upload-icon" style="background:linear-gradient(135deg,#dc2626,#ef4444)"><i class="fas fa-images"></i></div>
        <div class="upload-title">Drop images here or click to upload</div>
        <div class="upload-sub">JPG, PNG, WEBP — multiple files allowed</div>
        <span class="upload-btn">Choose Images</span>
        <input type="file" id="imageInput" multiple accept="image/*" hidden onchange="previewImagesToPDF()">
      </div>
      <div id="imgPreviewCount" class="small text-muted mt-2 text-center"></div>
      <div id="imgPreviewGrid" class="row g-2 mt-1"></div>
      <button class="btn-premium red mt-3" id="pdfBtn" onclick="generatePDF()"><i class="fas fa-magic me-2"></i>Generate PDF</button>${PRIVACY}
      ${seoBlock("fas fa-file-pdf","#dc3545","Images to PDF Converter",["Convert multiple JPG, PNG, or WEBP images into a single PDF instantly. Perfect for submitting scanned documents, government form attachments, or combining photos into one PDF.","No file size limits, no watermarks, no uploads. 100% private."])}`,

    resizer: `${BACK}
      ${infoBox("Resize your passport photo to the exact KB size required by SSC, UPSC, IBPS, or Railway exam portals — without losing visible quality.", "Your photo is 2MB → select 'Under 50KB' → download → file is now 48KB, ready to upload on SSC portal")}
      <div class="tool-header"><h3><i class="fas fa-id-card me-2 text-warning"></i>Exam Photo Resizer</h3><button class="btn btn-sm btn-outline-danger rounded-pill" onclick="resetResizer()"><i class="fas fa-redo me-1"></i>Reset</button></div>
      <div class="row g-3 mt-1">
        <div class="col-md-7">
          <div class="upload-zone" onclick="document.getElementById('resizeInput').click()">
            <div class="upload-icon" style="background:linear-gradient(135deg,#d97706,#f59e0b)"><i class="fas fa-id-card"></i></div>
            <div class="upload-title">Upload your photo</div>
            <div class="upload-sub">JPG, PNG, WEBP — for SSC, UPSC, Bank forms</div>
            <span class="upload-btn" style="background:#d97706">Choose Photo</span>
            <input type="file" id="resizeInput" accept="image/*" hidden onchange="previewResize()">
          </div>
          <div id="resPreview" class="mt-3 text-center"></div>
        </div>
        <div class="col-md-5">
          <div class="tool-panel">
            <label class="form-label fw-bold mb-2">Target Size</label>
            <select id="targetSize" class="form-select input-premium mb-3">
              <option value="20">Under 20KB — Signature</option>
              <option value="50" selected>Under 50KB — Photo</option>
              <option value="100">Under 100KB</option>
            </select>
            <button class="btn-premium orange" onclick="smartResize()"><i class="fas fa-download me-2"></i>Download Perfect Size</button>
            <div class="mt-3 p-3 rounded-3" style="background:#fff8f0;border:1px solid #fed7aa">
              <div class="small fw-bold text-warning mb-1"><i class="fas fa-info-circle me-1"></i>SSC/UPSC Requirements</div>
              <div class="small text-muted">Photo: 20–50KB | Signature: 10–20KB | Format: JPG</div>
            </div>
          </div>
        </div>
      </div>${PRIVACY}
      ${seoBlock("fas fa-id-card","#d97706","Exam Photo Resizer — SSC, UPSC, Bank Forms",["Automatically compress your photo to the exact size limit (20KB/50KB) without visible quality loss. Ready to upload on any exam portal.","Works for JPG, PNG, WEBP. No software needed. 100% free and private."])}`,

    merge: `${BACK}
      ${infoBox("Combine 2 or more PDF files into a single PDF — useful when a govt portal or college asks to submit all documents as one file.", "Resume.pdf + Marksheet.pdf + Aadhaar.pdf → Merge → All_Documents.pdf (1 file, ready to upload)")}
      <div class="tool-header"><h3><i class="fas fa-object-group me-2 text-primary"></i>Merge PDF</h3><button class="btn btn-sm btn-outline-danger rounded-pill" onclick="resetTool('merge',this)"><i class="fas fa-redo me-1"></i>Reset</button></div>
      <div class="upload-zone mt-3" onclick="document.getElementById('mergeInput').click()">
        <div class="upload-icon"><i class="fas fa-layer-group"></i></div>
        <div class="upload-title">Select PDF files to merge</div>
        <div class="upload-sub">Select 2 or more PDF files — order matters</div>
        <span class="upload-btn">Choose PDFs</span>
        <input type="file" id="mergeInput" accept="application/pdf" multiple hidden onchange="previewMergeFiles()">
      </div>
      <div id="mergeFileCount" class="small text-muted mt-2 text-center"></div>
      <div id="mergeFileList" class="mt-2"></div>
      <button class="btn-premium mt-3" id="mergeBtn" onclick="mergePDFs()"><i class="fas fa-layer-group me-2"></i>Merge & Download</button>${PRIVACY}
      ${seoBlock("fas fa-object-group","#4f46e5","Merge PDF Files Online — Free & Secure",["Combine two or more PDF files into a single document in seconds. No file size limit, no watermark, no account required.","All merging happens locally in your browser using PDF-lib. Your files are never uploaded to any server."])}`,

    split: `${BACK}
      ${infoBox("Extract a specific range of pages from a PDF and save as a new file — useful when you need only a few pages from a large document.", "50-page PDF, you need pages 10 to 15 → enter From: 10, To: 15 → download → 6-page PDF")}
      <div class="tool-header"><h3><i class="fas fa-cut me-2 text-warning"></i>Split PDF</h3><button class="btn btn-sm btn-outline-danger rounded-pill" onclick="resetTool('split',this)"><i class="fas fa-redo me-1"></i>Reset</button></div>
      <div class="upload-zone mt-3" onclick="document.getElementById('splitInput').click()">
        <div class="upload-icon" style="background:linear-gradient(135deg,#d97706,#f59e0b)"><i class="fas fa-cut"></i></div>
        <div class="upload-title">Upload PDF to split</div>
        <div class="upload-sub">Select the page range you want to extract</div>
        <span class="upload-btn" style="background:#d97706">Choose PDF</span>
        <input type="file" id="splitInput" accept="application/pdf" hidden onchange="previewSplitFile()">
      </div>
      <div id="splitFileInfo" class="mt-2"></div>
      <div class="row g-3 mt-2">
        <div class="col-6"><label class="form-label fw-bold small">From Page</label><input type="number" id="startPage" class="form-control input-premium" placeholder="1" min="1"></div>
        <div class="col-6"><label class="form-label fw-bold small">To Page</label><input type="number" id="endPage" class="form-control input-premium" placeholder="3" min="1"></div>
      </div>
      <button class="btn-premium orange mt-3" id="splitBtn" onclick="splitPDF()"><i class="fas fa-file-export me-2"></i>Split & Download</button>${PRIVACY}
      ${seoBlock("fas fa-cut","#d97706","Split PDF — Extract Specific Pages",["Extract a specific page range from any PDF and download it as a new file. Fast, free, and completely private — no uploads, no registration."])}`,

    compress: `${BACK}
      ${infoBox("Reduce the file size of any JPG, PNG, or WEBP image by adjusting quality — no visible difference at 70%+ quality.", "5MB photo → set quality 70% → compress → 180KB photo, same clarity, ready for email or WhatsApp")}
      <div class="tool-header"><h3><i class="fas fa-compress-arrows-alt me-2 text-info"></i>Image Compressor</h3><button class="btn btn-sm btn-outline-danger rounded-pill" onclick="resetCompressor()"><i class="fas fa-trash me-1"></i>Clear</button></div>
      <div class="row g-3 mt-1">
        <div class="col-md-6">
          <div class="upload-zone" onclick="document.getElementById('compressInput').click()">
            <div class="upload-icon" style="background:linear-gradient(135deg,#0891b2,#06b6d4)"><i class="fas fa-compress-arrows-alt"></i></div>
            <div class="upload-title">Upload image to compress</div>
            <div class="upload-sub">JPG, PNG, WEBP supported</div>
            <span class="upload-btn" style="background:#0891b2">Choose Image</span>
            <input type="file" id="compressInput" accept="image/*" hidden onchange="previewImage()">
          </div>
          <div class="mt-3">
            <label class="form-label fw-bold">Quality: <span id="qValue" class="text-info">70%</span></label>
            <input type="range" id="qualityRange" class="form-range" min="0.1" max="1.0" step="0.1" value="0.7" oninput="updateQDisplay(this.value)">
            <div class="d-flex justify-content-between small text-muted"><span>Smaller file</span><span>Better quality</span></div>
          </div>
        </div>
        <div class="col-md-6">
          <div id="previewArea" class="tool-panel h-100 d-flex align-items-center justify-content-center text-muted" style="min-height:180px;flex-direction:column;gap:8px">
            <i class="fas fa-image fa-2x opacity-25"></i>
            <span class="small">Preview appears here</span>
          </div>
        </div>
      </div>
      <button class="btn-premium info mt-3" onclick="compressImage()"><i class="fas fa-download me-2"></i>Compress & Download</button>${PRIVACY}
      ${seoBlock("fas fa-compress-arrows-alt","#0891b2","Image Compressor — Reduce File Size Online",["Compress JPG, PNG, or WEBP images without losing visible quality. Ideal for exam portals, websites, WhatsApp, or email.","All compression runs in your browser using HTML5 Canvas API. No server, no upload, 100% private."])}`,

    qrcode: `${BACK}
      ${infoBox("Generate a scannable QR code for any URL, UPI ID, phone number, or text — download as PNG and print or share.", "Your UPI ID: manav@okaxis → paste it → Generate → QR image ready → print on shop counter for payments")}
      <div class="tool-header"><h3><i class="fas fa-qrcode me-2"></i>QR Generator</h3><button class="btn btn-sm btn-outline-danger rounded-pill" onclick="resetQR()"><i class="fas fa-trash me-1"></i>Clear</button></div>
      <div class="tool-panel mt-3">
        <label class="form-label fw-bold">Enter URL, UPI ID, text or phone number</label>
        <input type="text" id="qrText" class="form-control input-premium mb-3" placeholder="https://example.com or upi://pay?pa=name@upi">
        <button class="btn-premium dark" onclick="generateQR()"><i class="fas fa-qrcode me-2"></i>Generate QR Code</button>
      </div>
      <div id="qrResult" class="text-center mt-4"></div>${PRIVACY}
      ${seoBlock("fas fa-qrcode","#1e293b","Free QR Code Generator",["Generate QR codes for URL, UPI ID, text, phone number — instantly, for free, 100% browser-based. Download as PNG.","No sign-up required. Works on all devices — mobile, tablet, and desktop."])}`,

    pdfToImg: `${BACK}
      ${infoBox("Convert every page of a PDF into separate JPG images — useful when you need to share individual pages as photos.", "10-page PDF → Extract → 10 JPG images, one per page → download all as ZIP or save individually")}
      <div class="tool-header"><h3><i class="fas fa-images me-2 text-info"></i>PDF to Image</h3><button class="btn btn-sm btn-outline-danger rounded-pill" onclick="resetPdfToImg()"><i class="fas fa-trash me-1"></i>Clear</button></div>
      <div class="upload-zone mt-3" onclick="document.getElementById('pdfInput').click()">
        <div class="upload-icon" style="background:linear-gradient(135deg,#0891b2,#06b6d4)"><i class="fas fa-file-pdf"></i></div>
        <div class="upload-title">Upload PDF to extract pages</div>
        <div class="upload-sub">Each page becomes a separate JPG image</div>
        <span class="upload-btn" style="background:#0891b2">Choose PDF</span>
        <input type="file" id="pdfInput" accept="application/pdf" hidden onchange="showPdfFileInfo('pdfInput','pdfFileInfoBox')">
      </div>
      <div id="pdfFileInfoBox" class="mt-2"></div>
      <button class="btn-premium info mt-3" id="pdfImgBtn" onclick="convertPdfToImg()"><i class="fas fa-images me-2"></i>Extract All Pages</button>
      <button class="btn-premium green mt-2 d-none" id="downloadAllBtn" onclick="downloadAllAsZip()"><i class="fas fa-file-archive me-2"></i>Download All as ZIP</button>
      <div id="pdfPreview" class="row g-3 mt-3"></div>${PRIVACY}
      ${seoBlock("fas fa-images","#0891b2","PDF to Image Converter — Extract Pages as JPG",["Convert every page of a PDF into high-quality JPEG images. Download all pages as ZIP or save individually.","Powered by PDF.js — runs entirely in your browser. No file upload, no data stored."])}`,

    pdfToWord: `${BACK}
      ${infoBox("Extract all readable text from a PDF file so you can copy, edit, or save it as a text file — works on digital PDFs (not scanned images).", "Bank statement PDF → Extract Text → editable text with all transaction details → download as .txt")}
      <div class="tool-header"><h3><i class="fas fa-file-alt me-2 text-info"></i>PDF to Text</h3></div>
      <div id="pdfUploadZone" class="upload-zone mt-3" onclick="document.getElementById('pdfFormatInput').click()">
        <div class="upload-icon" style="background:linear-gradient(135deg,#0891b2,#06b6d4)"><i class="fas fa-file-import"></i></div>
        <div class="upload-title">Upload PDF to extract text</div>
        <div class="upload-sub">Works on digital PDFs with selectable text</div>
        <span class="upload-btn" style="background:#0891b2">Choose PDF</span>
        <input type="file" id="pdfFormatInput" hidden accept="application/pdf" onchange="showPdfFileInfo('pdfFormatInput','pdfFormatInfoBox');processFormatPDF(this.files[0])">
      </div>
      <div id="pdfFormatInfoBox" class="mt-2"></div>
      <div id="editorZone" class="d-none mt-3">
        <label class="form-label fw-bold">Extracted Text</label>
        <textarea id="pdfEditor" class="form-control input-premium mb-3" rows="12" placeholder="Extracted text will appear here..."></textarea>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary rounded-pill flex-fill" onclick="openTool('pdfToWord')">Cancel</button>
          <button class="btn-premium info flex-fill" style="padding:10px" onclick="downloadFormattedPDF()"><i class="fas fa-download me-2"></i>Download Text</button>
        </div>
      </div>${PRIVACY}`,

    gst: `${BACK}
      ${infoBox("Calculate GST on any amount — add GST to get the final price, or remove GST to find the base price. Shows CGST and SGST split.", "Amount: ₹10,000 + 18% GST → Total: ₹11,800 (CGST: ₹900, SGST: ₹900)<br>Or: Invoice shows ₹11,800 → Remove GST → Base: ₹10,000")}
      <div class="tool-header"><h3><i class="fas fa-file-invoice-dollar me-2 text-success"></i>GST Calculator</h3><button class="btn btn-sm btn-outline-danger rounded-pill" onclick="resetGST()"><i class="fas fa-redo me-1"></i>Reset</button></div>
      <div class="tool-panel mt-3">
        <label class="form-label fw-bold">Amount (₹)</label>
        <input type="number" id="gstAmount" class="form-control input-premium mb-4" placeholder="e.g. 10000" style="font-size:1.1rem">
        <label class="form-label fw-bold mb-2">GST Rate</label>
        <div class="gst-rate-group mb-4">
          <div class="gst-rate-btn" onclick="document.getElementById('r5').checked=true;this.closest('.gst-rate-group').querySelectorAll('.gst-rate-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">5%<input type="radio" class="d-none" name="gstRate" id="r5" value="5"></div>
          <div class="gst-rate-btn" onclick="document.getElementById('r12').checked=true;this.closest('.gst-rate-group').querySelectorAll('.gst-rate-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">12%<input type="radio" class="d-none" name="gstRate" id="r12" value="12"></div>
          <div class="gst-rate-btn active" onclick="document.getElementById('r18').checked=true;this.closest('.gst-rate-group').querySelectorAll('.gst-rate-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">18%<input type="radio" class="d-none" name="gstRate" id="r18" value="18" checked></div>
          <div class="gst-rate-btn" onclick="document.getElementById('r28').checked=true;this.closest('.gst-rate-group').querySelectorAll('.gst-rate-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">28%<input type="radio" class="d-none" name="gstRate" id="r28" value="28"></div>
        </div>
        <div class="row g-2">
          <div class="col-6"><button onclick="calculateGST(true)" class="btn-premium green" style="padding:14px"><i class="fas fa-plus me-2"></i>Add GST</button></div>
          <div class="col-6"><button onclick="calculateGST(false)" class="btn-premium" style="padding:14px;background:linear-gradient(135deg,#0f766e,#14b8a6)"><i class="fas fa-minus me-2"></i>Remove GST</button></div>
        </div>
      </div>
      <div id="gstResult" class="result-card mt-3 d-none">
        <div class="row g-2 text-center mb-3">
          <div class="col-6"><div class="stat-badge"><div class="stat-val" id="resNet">0</div><div class="stat-lbl">Net Amount ₹</div></div></div>
          <div class="col-3"><div class="stat-badge"><div class="stat-val" style="font-size:1.1rem" id="resCGST">0</div><div class="stat-lbl">CGST ₹</div></div></div>
          <div class="col-3"><div class="stat-badge"><div class="stat-val" style="font-size:1.1rem" id="resSGST">0</div><div class="stat-lbl">SGST ₹</div></div></div>
        </div>
        <div class="d-flex justify-content-between align-items-center p-3 rounded-3" style="background:linear-gradient(135deg,#4f46e5,#7c3aed)">
          <span class="text-white fw-bold">Total Amount</span>
          <span class="text-white fw-bold" style="font-size:1.4rem">₹<span id="resTotal">0</span></span>
        </div>
      </div>${PRIVACY}
      ${seoBlock("fas fa-file-invoice-dollar","#16a34a","GST Calculator India — Add or Remove GST",["Calculate GST at 5%, 12%, 18%, or 28%. Shows CGST and SGST split automatically.","Use Add GST to find total price, or Remove GST to find base price. Trusted by Indian freelancers and small businesses."])}`,

    age: `${BACK}
      ${infoBox("Calculate your exact age in years, months, and days from your date of birth — set any cutoff date for govt exam eligibility check.", "DOB: 15 Jan 1995, Cutoff: 01 Jan 2026 → Age: 30 Years, 11 Months, 17 Days (eligible for SSC CGL)")}
      <div class="tool-header"><h3><i class="fas fa-birthday-cake me-2 text-danger"></i>Age Calculator</h3><button class="btn btn-sm btn-outline-danger rounded-pill" onclick="openTool('age')"><i class="fas fa-redo me-1"></i>Reset</button></div>
      <div class="tool-panel mt-3">
        <div class="row g-3 mb-3">
          <div class="col-md-6"><label class="form-label fw-bold">Date of Birth</label><input type="date" id="dob" class="form-control input-premium" style="font-size:1rem"></div>
          <div class="col-md-6"><label class="form-label fw-bold">Calculate Age As On</label><input type="date" id="todayDate" class="form-control input-premium" value="${new Date().toISOString().split("T")[0]}" style="font-size:1rem"></div>
        </div>
        <button class="btn-premium red" onclick="calculateAge()"><i class="fas fa-calculator me-2"></i>Calculate Age</button>
      </div>
      <div id="ageResult" class="mt-3 d-none">
        <div class="result-card text-center mb-3">
          <div class="small text-muted mb-1">Your Exact Age</div>
          <div style="font-size:2.2rem;font-weight:800;color:#4f46e5" id="mainAge">--</div>
          <div class="text-muted mt-1" id="extraAge">--</div>
        </div>
        <div class="row g-2">
          <div class="col-4"><div class="age-stat"><div class="age-val" id="totalMonths">--</div><div class="age-lbl">Months</div></div></div>
          <div class="col-4"><div class="age-stat"><div class="age-val" id="totalWeeks">--</div><div class="age-lbl">Weeks</div></div></div>
          <div class="col-4"><div class="age-stat"><div class="age-val" id="totalDays">--</div><div class="age-lbl">Days</div></div></div>
        </div>
      </div>${PRIVACY}
      ${seoBlock("fas fa-birthday-cake","#dc2626","Age Calculator — Exact Age for Government Forms",["Calculate exact age in years, months, and days. Set any target date — useful for SSC, UPSC, Railway exam cutoff dates."])}`,

    removePages: `${BACK}
      ${infoBox("Visually select and delete specific pages from a PDF — see thumbnail previews before removing.", "20-page PDF has 3 blank pages at positions 5, 12, 18 → click those thumbnails → Remove → 17-page clean PDF")}
      <div class="tool-header"><h3><i class="fas fa-file-signature me-2 text-danger"></i>Remove PDF Pages</h3><button class="btn btn-sm btn-outline-danger rounded-pill" onclick="openTool('removePages')"><i class="fas fa-redo me-1"></i>Reset</button></div>
      <div class="upload-zone mt-3" onclick="document.getElementById('removeInput').click()">
        <div class="upload-icon" style="background:linear-gradient(135deg,#dc2626,#ef4444)"><i class="fas fa-file-signature"></i></div>
        <div class="upload-title">Upload PDF to remove pages</div>
        <div class="upload-sub">Visual preview will show all pages</div>
        <span class="upload-btn" style="background:#dc2626">Choose PDF</span>
        <input type="file" id="removeInput" accept="application/pdf" hidden onchange="previewPdfPages()">
      </div>
      <div id="pdfPreviewContainer" class="row g-2 mt-3 mb-3"></div>
      <div id="pageInputSection" class="d-none mb-3">
        <label class="form-label fw-bold">Page numbers to remove</label>
        <input type="text" id="pageNumbers" class="form-control input-premium" placeholder="e.g. 1, 3, 5" oninput="markPagesForRemoval()">
        <div class="form-text text-muted">Or click thumbnails above to select pages</div>
      </div>
      <button class="btn-premium red d-none" id="removeBtn" onclick="handleRemovePages()"><i class="fas fa-trash me-2"></i>Remove Selected & Download</button>${PRIVACY}
      ${seoBlock("fas fa-file-signature","#dc2626","Remove PDF Pages — Delete Unwanted Pages",["Select and remove specific pages from any PDF. Visual thumbnail preview lets you see each page before deleting.","Runs entirely in your browser using PDF-lib. No uploads, no data stored."])}`,

    wordCounter: `${BACK}
      ${infoBox("Count words, characters, sentences and estimate reading time for any text — useful for UPSC/SSC essays, articles, and social media posts.", "Paste your UPSC answer (250 words limit) → instantly see word count → trim if over limit before writing in answer sheet")}
      <div class="tool-header"><h3><i class="fas fa-font me-2" style="color:#f093fb"></i>Word Counter</h3><button class="btn btn-sm btn-outline-danger rounded-pill" onclick="document.getElementById('wcText').value='';updateWordCount()"><i class="fas fa-trash me-1"></i>Clear</button></div>
      <textarea id="wcText" class="form-control input-premium mt-3 mb-3" rows="7" placeholder="Paste or type your text here..." oninput="updateWordCount()" style="resize:vertical"></textarea>
      <div class="row g-2">
        <div class="col-6 col-md-3"><div class="stat-badge"><div class="stat-val" id="wcWords">0</div><div class="stat-lbl">Words</div></div></div>
        <div class="col-6 col-md-3"><div class="stat-badge" style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-color:#bbf7d0"><div class="stat-val" style="color:#16a34a" id="wcChars">0</div><div class="stat-lbl">Characters</div></div></div>
        <div class="col-6 col-md-3"><div class="stat-badge" style="background:linear-gradient(135deg,#fff8f0,#fef3c7);border-color:#fde68a"><div class="stat-val" style="color:#d97706" id="wcSentences">0</div><div class="stat-lbl">Sentences</div></div></div>
        <div class="col-6 col-md-3"><div class="stat-badge" style="background:linear-gradient(135deg,#fef2f2,#fee2e2);border-color:#fecaca"><div class="stat-val" style="color:#dc2626" id="wcReadTime">0</div><div class="stat-lbl">Min Read</div></div></div>
      </div>${PRIVACY}
      ${seoBlock("fas fa-font","#9333ea","Word Counter & Text Analyzer",["Count words, characters, sentences, and estimated reading time instantly. Useful for essays, UPSC/SSC answers, social media, and articles.","Works entirely in your browser — no data is sent anywhere."])}`,

    password: `${BACK}
      ${infoBox("Generate a strong, random password with uppercase, lowercase, numbers and symbols — choose length from 8 to 64 characters.", "Length: 16, all options ON → generates: Kx#9mP2@qRtY7vLw → copy and save in your password manager")}
      <div class="tool-header"><h3><i class="fas fa-key me-2 text-warning"></i>Password Generator</h3></div>
      <div class="tool-panel mt-3">
        <div class="input-group mb-3">
          <input type="text" id="pwdOutput" class="form-control input-premium fw-bold font-monospace" style="font-size:1.05rem;letter-spacing:1px" readonly placeholder="Click Generate...">
          <button class="btn btn-outline-secondary rounded-end" onclick="copyPassword()" title="Copy"><i class="fas fa-copy"></i></button>
        </div>
        <label class="form-label fw-bold">Length: <span id="pwdLenVal" class="text-primary">16</span> characters</label>
        <input type="range" id="pwdLen" class="form-range mb-3" min="8" max="64" value="16" oninput="document.getElementById('pwdLenVal').textContent=this.value">
        <div class="row g-2 mb-3">
          <div class="col-6"><label class="d-flex align-items-center gap-2 p-2 rounded-3 border" style="cursor:pointer"><input type="checkbox" id="pwdUpper" checked class="form-check-input m-0"><span class="small fw-bold">A–Z Uppercase</span></label></div>
          <div class="col-6"><label class="d-flex align-items-center gap-2 p-2 rounded-3 border" style="cursor:pointer"><input type="checkbox" id="pwdLower" checked class="form-check-input m-0"><span class="small fw-bold">a–z Lowercase</span></label></div>
          <div class="col-6"><label class="d-flex align-items-center gap-2 p-2 rounded-3 border" style="cursor:pointer"><input type="checkbox" id="pwdNum" checked class="form-check-input m-0"><span class="small fw-bold">0–9 Numbers</span></label></div>
          <div class="col-6"><label class="d-flex align-items-center gap-2 p-2 rounded-3 border" style="cursor:pointer"><input type="checkbox" id="pwdSym" checked class="form-check-input m-0"><span class="small fw-bold">!@#$ Symbols</span></label></div>
        </div>
        <button class="btn-premium orange" onclick="generatePassword()"><i class="fas fa-sync me-2"></i>Generate Password</button>
      </div>
      <div id="pwdStrength" class="mt-3 d-none">
        <div class="d-flex align-items-center gap-2">
          <span class="small fw-bold">Strength:</span>
          <div class="strength-track flex-fill"><div id="pwdStrBar" class="strength-fill" style="width:0%"></div></div>
          <span id="pwdStrLabel" class="small fw-bold" style="min-width:50px"></span>
        </div>
      </div>${PRIVACY}
      ${seoBlock("fas fa-key","#d97706","Strong Password Generator — Free & Secure",["Generate cryptographically random passwords. Choose any length from 8 to 64 characters with uppercase, lowercase, numbers, and symbols.","Passwords are generated entirely in your browser — never transmitted or stored anywhere."])}`,

    base64: `${BACK}
      ${infoBox("Encode plain text to Base64 format or decode Base64 back to readable text — used by developers for APIs, data URLs, and debugging.", "Text: Hello World → Encode → SGVsbG8gV29ybGQ=<br>Or paste SGVsbG8gV29ybGQ= → Decode → Hello World")}
      <div class="tool-header"><h3><i class="fas fa-code me-2" style="color:#8e2de2"></i>Base64 Encoder / Decoder</h3></div>
      <div class="tool-panel mt-3">
        <label class="form-label fw-bold">Input</label>
        <textarea id="b64Input" class="form-control input-premium mb-3 font-monospace" rows="4" placeholder="Enter text to encode or Base64 string to decode..."></textarea>
        <div class="row g-2 mb-3">
          <div class="col-6"><button class="btn-premium" onclick="doBase64('encode')"><i class="fas fa-lock me-2"></i>Encode</button></div>
          <div class="col-6"><button class="btn-premium" style="background:linear-gradient(135deg,#7c3aed,#a855f7)" onclick="doBase64('decode')"><i class="fas fa-unlock me-2"></i>Decode</button></div>
        </div>
      </div>
      <div id="b64Result" class="d-none mt-3">
        <label class="form-label fw-bold">Result</label>
        <div class="input-group">
          <textarea id="b64Output" class="form-control input-premium font-monospace" rows="4" readonly></textarea>
          <button class="btn btn-outline-secondary" onclick="navigator.clipboard.writeText(document.getElementById('b64Output').value);showNotify('info','Copied!')"><i class="fas fa-copy"></i></button>
        </div>
      </div>${PRIVACY}
      ${seoBlock("fas fa-code","#7c3aed","Base64 Encoder & Decoder Online",["Encode plain text to Base64 or decode Base64 back to readable text. Used by developers for CSS image encoding, URL data, and API debugging.","Runs entirely in your browser — no server, no data logging."])}`,

    unitConverter: `${BACK}
      ${infoBox("Convert between units of length, weight, temperature, area and speed — instant results as you type.", "5 feet → meters: 1.524 m | 100°F → Celsius: 37.78°C | 10 km/h → mph: 6.21 mph")}
      <div class="tool-header"><h3><i class="fas fa-ruler-combined me-2" style="color:#0d9488"></i>Unit Converter</h3></div>
      <div class="tool-panel mt-3">
        <label class="form-label fw-bold">Category</label>
        <select id="ucCategory" class="form-select input-premium mb-4" onchange="updateUnitOptions()">
          <option value="length">📏 Length</option>
          <option value="weight">⚖️ Weight</option>
          <option value="temperature">🌡️ Temperature</option>
          <option value="area">📐 Area</option>
          <option value="speed">🚀 Speed</option>
        </select>
        <div class="row g-3 align-items-end">
          <div class="col-md-5">
            <label class="form-label fw-bold small">From</label>
            <select id="ucFrom" class="form-select input-premium mb-2"></select>
            <input type="number" id="ucValue" class="form-control input-premium" placeholder="Enter value" oninput="convertUnit()">
          </div>
          <div class="col-md-2 text-center pb-2"><i class="fas fa-exchange-alt fa-lg text-muted"></i></div>
          <div class="col-md-5">
            <label class="form-label fw-bold small">To</label>
            <select id="ucTo" class="form-select input-premium mb-2"></select>
            <input type="text" id="ucResult" class="form-control input-premium fw-bold" style="background:#f8f7ff;color:#4f46e5" readonly placeholder="Result">
          </div>
        </div>
      </div>${PRIVACY}
      ${seoBlock("fas fa-ruler-combined","#0d9488","Unit Converter — Length, Weight, Temperature & More",["Convert between length, weight, temperature, area, and speed units. Instant results as you type."])}`,

    loremIpsum: `${BACK}
      ${infoBox("Generate placeholder dummy text by words, sentences, or paragraphs — used by designers and developers to fill layouts before real content is ready.", "Select: Paragraphs, Count: 3 → Generate → 3 paragraphs of Lorem Ipsum text → copy and paste into your Figma/HTML design mockup")}
      <div class="tool-header"><h3><i class="fas fa-align-left me-2" style="color:#f7971e"></i>Lorem Ipsum Generator</h3></div>
      <div class="tool-panel mt-3">
        <div class="row g-3 mb-3">
          <div class="col-md-5"><label class="form-label fw-bold small">Type</label><select id="loremType" class="form-select input-premium"><option value="paragraphs">Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option></select></div>
          <div class="col-md-3"><label class="form-label fw-bold small">Count</label><input type="number" id="loremCount" class="form-control input-premium" value="3" min="1" max="50"></div>
          <div class="col-md-4 d-flex align-items-end"><button class="btn-premium orange" onclick="generateLorem()"><i class="fas fa-magic me-2"></i>Generate</button></div>
        </div>
      </div>
      <div id="loremResult" class="d-none mt-3">
        <div class="input-group">
          <textarea id="loremOutput" class="form-control input-premium" rows="8" readonly style="resize:vertical"></textarea>
          <button class="btn btn-outline-secondary" onclick="navigator.clipboard.writeText(document.getElementById('loremOutput').value);showNotify('info','Copied!')"><i class="fas fa-copy"></i></button>
        </div>
      </div>${PRIVACY}
      ${seoBlock("fas fa-align-left","#d97706","Lorem Ipsum Generator — Placeholder Text for Designers",["Generate Lorem Ipsum placeholder text by words, sentences, or paragraphs. Used by designers and developers to fill layouts."])}`,

    emi: `${BACK}
      ${infoBox("Calculate your monthly EMI for any loan — home, car, or personal. Shows total interest payable and month-by-month repayment schedule.", "Loan: ₹5,00,000 | Rate: 9% | Tenure: 60 months → EMI: ₹10,378/month | Total interest: ₹1,22,670")}
      <div class="tool-header"><h3><i class="fas fa-home me-2 text-success"></i>EMI Calculator</h3><button class="btn btn-sm btn-outline-danger rounded-pill" onclick="resetEMI()"><i class="fas fa-redo me-1"></i>Reset</button></div>
      <div class="tool-panel mt-3">
        <div class="row g-3 mb-2">
          <div class="col-md-4"><label class="form-label fw-bold small">Loan Amount (₹)</label><input type="number" id="emiAmount" class="form-control input-premium" placeholder="e.g. 500000" oninput="calcEMI()"></div>
          <div class="col-md-4"><label class="form-label fw-bold small">Interest Rate (% / year)</label><input type="number" id="emiRate" class="form-control input-premium" placeholder="e.g. 8.5" step="0.1" oninput="calcEMI()"></div>
          <div class="col-md-4"><label class="form-label fw-bold small">Tenure (Months)</label><input type="number" id="emiTenure" class="form-control input-premium" placeholder="e.g. 60" oninput="calcEMI()"></div>
        </div>
      </div>
      <div id="emiResult" class="d-none mt-3">
        <div class="row g-3 text-center mb-3">
          <div class="col-4"><div class="stat-badge" style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-color:#bbf7d0"><div class="stat-val" style="color:#16a34a" id="emiMonthly">₹0</div><div class="stat-lbl">Monthly EMI</div></div></div>
          <div class="col-4"><div class="stat-badge"><div class="stat-val" id="emiTotalAmt">₹0</div><div class="stat-lbl">Total Amount</div></div></div>
          <div class="col-4"><div class="stat-badge" style="background:linear-gradient(135deg,#fef2f2,#fee2e2);border-color:#fecaca"><div class="stat-val" style="color:#dc2626" id="emiInterest">₹0</div><div class="stat-lbl">Total Interest</div></div></div>
        </div>
        <div class="mb-2 d-flex justify-content-between small fw-bold"><span>Principal</span><span id="emiPrincipalBar">0%</span></div>
        <div class="progress mb-3" style="height:10px;border-radius:8px">
          <div id="emiProgressBar" class="progress-bar bg-success" style="width:0%"></div>
          <div id="emiInterestBar" class="progress-bar bg-danger" style="width:0%"></div>
        </div>
        <div class="table-responsive" style="max-height:280px;overflow-y:auto">
          <table class="table table-sm table-bordered text-center small">
            <thead class="table-dark sticky-top"><tr><th>#</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>
            <tbody id="emiTableBody"></tbody>
          </table>
        </div>
      </div>${PRIVACY}
      ${seoBlock("fas fa-home","#16a34a","EMI Calculator — Home, Car & Personal Loan",["Calculate exact monthly EMI for any loan. Enter amount, interest rate, and tenure to get instant results with full amortization schedule.","100% free, no sign-up, instant calculation."])}`,

    imageToText: `${BACK}
      ${infoBox("Extract editable text from any image or photo — works on screenshots, textbook photos, signboards, scanned documents. Powered by Tesseract OCR running in your browser.", "Photo of a printed letter → upload → OCR reads it → copy the extracted text → paste into Word or Google Docs")}
      <div class="tool-header"><h3><i class="fas fa-camera me-2 text-primary"></i>Image to Text (OCR)</h3><button class="btn btn-sm btn-outline-danger rounded-pill" onclick="resetOCR()"><i class="fas fa-trash me-1"></i>Clear</button></div>
      <div class="upload-zone mt-3" onclick="document.getElementById('ocrInput').click()">
        <div class="upload-icon"><i class="fas fa-image"></i></div>
        <div class="upload-title">Upload image to extract text</div>
        <div class="upload-sub">JPG, PNG, WEBP — any photo with printed text</div>
        <span class="upload-btn">Choose Image</span>
        <input type="file" id="ocrInput" hidden accept="image/*" onchange="runOCR(this.files[0])">
      </div>
      <div id="ocrPreviewBox" class="d-none mt-3 text-center">
        <img id="ocrPreviewImg" class="img-fluid rounded shadow-sm" style="max-height:200px" alt="preview"/>
      </div>
      <div id="ocrProgress" class="d-none mt-3 mb-3">
        <div class="d-flex justify-content-between small fw-bold mb-1"><span>Recognizing text...</span><span id="ocrPct">0%</span></div>
        <div class="progress" style="height:8px"><div id="ocrBar" class="progress-bar bg-primary progress-bar-striped progress-bar-animated" style="width:0%"></div></div>
      </div>
      <div id="ocrResultBox" class="d-none mt-3">
        <label class="form-label fw-bold">Extracted Text</label>
        <div class="input-group">
          <textarea id="ocrOutput" class="form-control input-premium font-monospace" rows="8" placeholder="Text will appear here..."></textarea>
          <button class="btn btn-outline-secondary" onclick="navigator.clipboard.writeText(document.getElementById('ocrOutput').value);showNotify('success','Copied!')"><i class="fas fa-copy"></i></button>
        </div>
        <button class="btn-premium mt-2" onclick="downloadOCRText()"><i class="fas fa-download me-2"></i>Download as .txt</button>
      </div>${PRIVACY}
      ${seoBlock("fas fa-camera","#4f46e5","Image to Text Converter — Free OCR Online",["Extract text from any image, screenshot, photo, or scanned document instantly. Powered by Tesseract.js — runs 100% in your browser.","No image is uploaded to any server."])}`,

    percentage: `${BACK}
      ${infoBox("4 calculators in one — find X% of Y, calculate % increase/decrease, find marks percentage, and calculate discount price.", "Marks: 385 out of 500 → Marks %: 77%  |  Original price ₹2000, discount 25% → Final price: ₹1500 (Save ₹500)")}
      <div class="tool-header"><h3><i class="fas fa-percent me-2 text-warning"></i>Percentage Calculator</h3><button class="btn btn-sm btn-outline-danger rounded-pill" onclick="resetPct()"><i class="fas fa-redo me-1"></i>Reset</button></div>
      <div class="row g-3 mt-1">
        <div class="col-md-6">
          <div class="tool-panel mb-3">
            <h6 class="fw-bold mb-3 text-primary"><i class="fas fa-calculator me-2"></i>What is X% of Y?</h6>
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <input type="number" id="pct1X" class="form-control input-premium" style="width:90px" placeholder="X" oninput="calcPct1()">
              <span class="fw-bold">% of</span>
              <input type="number" id="pct1Y" class="form-control input-premium" style="width:90px" placeholder="Y" oninput="calcPct1()">
              <span class="fw-bold">=</span>
              <span class="fw-bold text-success fs-5" id="pct1Res">—</span>
            </div>
          </div>
          <div class="tool-panel">
            <h6 class="fw-bold mb-3 text-danger"><i class="fas fa-arrow-up me-2"></i>% Increase / Decrease</h6>
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <input type="number" id="pct2From" class="form-control input-premium" style="width:90px" placeholder="From" oninput="calcPct2()">
              <span class="fw-bold">→</span>
              <input type="number" id="pct2To" class="form-control input-premium" style="width:90px" placeholder="To" oninput="calcPct2()">
              <span class="fw-bold">=</span>
              <span class="fw-bold fs-5" id="pct2Res">—</span>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="tool-panel mb-3">
            <h6 class="fw-bold mb-3 text-success"><i class="fas fa-graduation-cap me-2"></i>Marks Percentage</h6>
            <div class="row g-2 mb-2">
              <div class="col-6"><input type="number" id="pctMarks" class="form-control input-premium" placeholder="Marks Obtained" oninput="calcPct3()"></div>
              <div class="col-6"><input type="number" id="pctTotal" class="form-control input-premium" placeholder="Total Marks" oninput="calcPct3()"></div>
            </div>
            <div class="text-center"><span class="fw-bold fs-4 text-success" id="pct3Res">—</span></div>
          </div>
          <div class="tool-panel">
            <h6 class="fw-bold mb-3 text-info"><i class="fas fa-tag me-2"></i>Discount Calculator</h6>
            <div class="row g-2 mb-2">
              <div class="col-6"><input type="number" id="pctPrice" class="form-control input-premium" placeholder="Original Price" oninput="calcPct4()"></div>
              <div class="col-6"><input type="number" id="pctDisc" class="form-control input-premium" placeholder="Discount %" oninput="calcPct4()"></div>
            </div>
            <div class="text-center"><span class="fw-bold fs-5 text-info" id="pct4Res">—</span></div>
          </div>
        </div>
      </div>${PRIVACY}
      ${seoBlock("fas fa-percent","#d97706","Percentage Calculator — Marks, Discount & More",["4 calculators in one: find X% of Y, percentage increase/decrease, marks percentage, and discount price. Instant results."])}`,

    caseConverter: `${BACK}
      ${infoBox("Convert any text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, or snake_case with one click — no retyping needed.", "Input: 'hello world from india' → Title Case → 'Hello World From India'  |  camelCase → 'helloWorldFromIndia'")}
      <div class="tool-header"><h3><i class="fas fa-text-height me-2" style="color:#8e2de2"></i>Text Case Converter</h3><button class="btn btn-sm btn-outline-danger rounded-pill" onclick="document.getElementById('caseInput').value='';document.getElementById('caseOutput').value='';document.getElementById('caseResultBox').classList.add('d-none')"><i class="fas fa-trash me-1"></i>Clear</button></div>
      <textarea id="caseInput" class="form-control input-premium mt-3 mb-3" rows="5" placeholder="Type or paste your text here..." style="resize:vertical"></textarea>
      <div class="row g-2 mb-3">
        <div class="col-6 col-md-4"><button class="btn btn-outline-primary w-100 fw-bold rounded-3" onclick="convertCase('upper')">UPPERCASE</button></div>
        <div class="col-6 col-md-4"><button class="btn btn-outline-secondary w-100 fw-bold rounded-3" onclick="convertCase('lower')">lowercase</button></div>
        <div class="col-6 col-md-4"><button class="btn btn-outline-success w-100 fw-bold rounded-3" onclick="convertCase('title')">Title Case</button></div>
        <div class="col-6 col-md-4"><button class="btn btn-outline-warning w-100 fw-bold rounded-3" onclick="convertCase('sentence')">Sentence case</button></div>
        <div class="col-6 col-md-4"><button class="btn btn-outline-danger w-100 fw-bold rounded-3" onclick="convertCase('camel')">camelCase</button></div>
        <div class="col-6 col-md-4"><button class="btn btn-outline-dark w-100 fw-bold rounded-3" onclick="convertCase('snake')">snake_case</button></div>
      </div>
      <div id="caseResultBox" class="d-none">
        <label class="form-label fw-bold">Result</label>
        <div class="input-group">
          <textarea id="caseOutput" class="form-control input-premium" rows="5" readonly style="resize:vertical"></textarea>
          <button class="btn btn-outline-secondary" onclick="navigator.clipboard.writeText(document.getElementById('caseOutput').value);showNotify('success','Copied!')"><i class="fas fa-copy"></i></button>
        </div>
      </div>${PRIVACY}
      ${seoBlock("fas fa-text-height","#7c3aed","Text Case Converter — UPPERCASE, lowercase, camelCase",["Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, or snake_case with one click. Paste text, click format, copy result."])}`,

    stopwatch: `${BACK}
      ${infoBox("A precise stopwatch with lap recording + a countdown timer — both in one tool. Use for workouts, cooking, study sessions (Pomodoro), or any timed activity.", "Pomodoro study: set timer 25 min → Study → Start → timer beeps → take 5 min break. Lap feature records each session time.")}
      <div class="tool-header"><h3><i class="fas fa-stopwatch me-2 text-danger"></i>Stopwatch & Timer</h3></div>
      <div class="row g-3 mt-1">
        <div class="col-md-6">
          <div class="tool-panel text-center">
            <h6 class="fw-bold text-muted mb-3 text-uppercase small">Stopwatch</h6>
            <div class="sw-display mb-3" id="swDisplay">00:00.00</div>
            <div class="d-flex gap-2 justify-content-center mb-3">
              <button id="swStartBtn" class="btn-premium green px-4" style="padding:10px 20px" onclick="swStart()"><i class="fas fa-play me-1"></i>Start</button>
              <button class="btn btn-warning px-3 rounded-3 fw-bold" onclick="swLap()"><i class="fas fa-flag me-1"></i>Lap</button>
              <button class="btn btn-danger px-3 rounded-3 fw-bold" onclick="swReset()"><i class="fas fa-redo me-1"></i>Reset</button>
            </div>
            <div id="swLaps" class="text-start" style="max-height:160px;overflow-y:auto"></div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="tool-panel text-center">
            <h6 class="fw-bold text-muted mb-3 text-uppercase small">Countdown Timer</h6>
            <div class="timer-display mb-3" id="timerDisplay">00:00</div>
            <div class="row g-2 mb-3">
              <div class="col-6"><input type="number" id="timerMin" class="form-control input-premium text-center fw-bold" placeholder="Min" min="0" max="99"></div>
              <div class="col-6"><input type="number" id="timerSec" class="form-control input-premium text-center fw-bold" placeholder="Sec" min="0" max="59"></div>
            </div>
            <div class="d-flex gap-2 justify-content-center">
              <button id="timerStartBtn" class="btn-premium red px-4" style="padding:10px 20px" onclick="timerStart()"><i class="fas fa-play me-1"></i>Start</button>
              <button class="btn btn-secondary px-3 rounded-3 fw-bold" onclick="timerReset()"><i class="fas fa-redo me-1"></i>Reset</button>
            </div>
          </div>
        </div>
      </div>${PRIVACY}
      ${seoBlock("fas fa-stopwatch","#dc2626","Online Stopwatch & Countdown Timer",["Precise stopwatch with lap time recording, plus a countdown timer. Works on mobile and desktop.","No app download needed. Free forever."])}`,
  };

  container.innerHTML = tpl[name] || `${BACK}<div class="text-center py-5"><i class="fas fa-tools fa-3x text-muted mb-3"></i><h5>Tool not found</h5></div>`;

  if (name === "unitConverter") updateUnitOptions();
  if (name === "stopwatch") initStopwatch();
}

// showExtra is defined in tools-logic.js
// window.onpopstate is defined in tools-logic.js
