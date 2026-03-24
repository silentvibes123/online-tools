// ===== INIT =====
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

const VALID_TOOLS = ["cash","resizer","age","pdf","compress","qrcode","pdfToImg","voice","merge","split","wordToPdf","pdfToWord","gst","removePages","wordCounter","password","base64","unitConverter","loremIpsum"];

window.addEventListener("load", () => {
  const path = location.pathname.replace("/","");
  if (VALID_TOOLS.includes(path)) openTool(path);
  else updateDynamicTitle(null);
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
  cash:    ["Online Cash Counter & Denomination Calculator | SwiftTool Pro", "Calculate total cash with Indian currency denominations. Print professional receipts."],
  resizer: ["Exam Photo Resizer (20KB-50KB) for SSC, UPSC, Bank | SwiftTool Pro", "Resize photos for SSC, UPSC, IBPS exams. Compress to 20KB/50KB without quality loss."],
  age:     ["Accurate Age Calculator by Date of Birth | SwiftTool Pro", "Calculate exact age in years, months, days. Perfect for govt job forms."],
  pdf:     ["Images to PDF Converter | SwiftTool Pro", "Convert JPG, PNG, WEBP images into a single PDF instantly."],
  compress:["Compress Image to 20KB & 50KB Online | SwiftTool Pro", "Reduce image file size without losing clarity. Best for exam portals."],
  qrcode:  ["Free QR Code Generator | SwiftTool Pro", "Create custom QR codes for URL, text, UPI. Instant download."],
  pdfToImg:["PDF to Image Converter Online | SwiftTool Pro", "Convert PDF pages into high-quality JPEG images securely."],
  voice:   ["AI Voice - Free Text to Speech | SwiftTool Pro", "Convert text or PDF into natural AI voice. Free & private."],
  merge:   ["Merge PDF Files Online | SwiftTool Pro", "Combine multiple PDFs into one file securely."],
  split:   ["Split PDF Pages Online | SwiftTool Pro", "Extract specific pages from PDF instantly."],
  gst:     ["GST Calculator India - Add/Remove GST | SwiftTool Pro", "Calculate GST with CGST/SGST split. Free Indian GST tool."],
  removePages: ["Remove PDF Pages Online | SwiftTool Pro", "Delete specific pages from PDF with visual preview."],
  wordToPdf:   ["Word to PDF Converter | SwiftTool Pro", "Convert DOCX to PDF securely in your browser."],
  wordCounter: ["Word Counter & Text Analyzer | SwiftTool Pro", "Count words, characters, sentences and analyze your text."],
  password:    ["Strong Password Generator | SwiftTool Pro", "Generate secure random passwords instantly."],
  base64:      ["Base64 Encoder & Decoder Online | SwiftTool Pro", "Encode or decode Base64 text instantly in your browser."],
  unitConverter: ["Unit Converter - Length, Weight, Temperature | SwiftTool Pro", "Convert units of length, weight, temperature and more."],
  loremIpsum:  ["Lorem Ipsum Generator | SwiftTool Pro", "Generate placeholder dummy text for design and development."],
};

function updateDynamicTitle(tool) {
  const meta = TOOL_META[tool];
  document.title = meta ? meta[0] : "SwiftTool Pro - Free Online Digital Toolkit";
  const tag = document.querySelector('meta[name="description"]');
  if (tag) tag.setAttribute("content", meta ? meta[1] : "Free online tools: image resizer, PDF tools, GST calculator. 100% browser-based.");
}

// ===== NAVIGATION =====
function openTool(name) {
  ["toolsGrid","activeTool","extraScreens"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.classList.add("d-none"); el.style.display = ""; }
  });
  const hero = document.querySelector(".hero-section")?.closest(".container");
  const stats = document.querySelector(".stats-bar")?.closest(".container");
  if (hero) hero.classList.add("d-none");
  if (stats) stats.classList.add("d-none");

  const activeTool = document.getElementById("activeTool");
  const toolUI = document.getElementById("toolUI");
  if (activeTool) { activeTool.classList.remove("d-none"); activeTool.style.display = "block"; }

  if (location.pathname !== "/" + name) history.pushState({tool:name}, "", "/" + name);
  updateDynamicTitle(name);
  const canonical = document.getElementById("canonicalTag");
  if (canonical) canonical.setAttribute("href", "https://www.swifttoolpro.com/" + name);

  if (toolUI) { toolUI.innerHTML = ""; renderToolContent(name, toolUI); }
  window.scrollTo({top:0, behavior:"smooth"});
}

function goToDashboard() {
  ["activeTool","extraScreens"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.classList.add("d-none"); el.style.display = "none"; }
  });
  const toolsGrid = document.getElementById("toolsGrid");
  if (toolsGrid) toolsGrid.classList.remove("d-none");
  const hero = document.querySelector(".hero-section")?.closest(".container");
  const stats = document.querySelector(".stats-bar")?.closest(".container");
  if (hero) hero.classList.remove("d-none");
  if (stats) stats.classList.remove("d-none");
  history.pushState({}, "", "/");
  updateDynamicTitle(null);
  document.getElementById("toolUI").innerHTML = "";
}

function showDashboard() { goToDashboard(); window.scrollTo(0,0); }
function goBack() { goToDashboard(); }

// ===== CATEGORY FILTER =====
function filterByCategory(cat, el) {
  document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
  el.classList.add("active");
  document.querySelectorAll(".tool-item").forEach(item => {
    item.style.display = (cat === "all" || item.dataset.cat === cat) ? "" : "none";
  });
}

// ===== SEARCH =====
function filterTools() {
  const q = document.getElementById("toolSearch").value.toLowerCase();
  let found = 0;
  document.querySelectorAll(".tool-item").forEach(item => {
    const match = item.dataset.search.includes(q) || item.querySelector("h6").innerText.toLowerCase().includes(q);
    item.style.display = match ? "" : "none";
    if (match) found++;
  });
  let msg = document.getElementById("noResultMsg");
  if (!found && q) {
    if (!msg) {
      msg = document.createElement("div"); msg.id = "noResultMsg";
      msg.className = "col-12 text-center py-4";
      msg.innerHTML = `<i class="fas fa-search-minus fa-2x text-muted mb-2"></i><p class="text-muted">No tool found for "<b>${q}</b>". Try 'PDF', 'GST', or '20KB'.</p>`;
      document.getElementById("toolCardsRow").appendChild(msg);
    }
  } else if (msg) msg.remove();
}

// ===== PRIVACY BADGE =====
const PRIVACY = `<div class="privacy-badge mt-3"><i class="fas fa-shield-halved me-1"></i>100% Private — Files never leave your browser</div>`;

// ===== BACK BUTTON =====
const BACK = `<div class="mb-4"><button class="btn btn-sm btn-light border shadow-sm px-3" onclick="goToDashboard()"><i class="fas fa-arrow-left me-2 text-primary"></i>Back</button></div>`;

// ===== RENDER TOOL CONTENT =====
function renderToolContent(name, container) {
  const tpl = {
    cash: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-calculator me-2 text-success"></i>Cash Counter</h3><button class="btn btn-sm btn-outline-danger" onclick="resetCash()"><i class="fas fa-redo me-1"></i>Reset</button></div><hr>
      <div class="row">
        <div class="col-md-6">${[2000,500,200,100,50,20,10,5,2,1].map(n=>`<div class="d-flex align-items-center mb-2"><span class="fw-bold w-25">₹${n}</span><input type="number" class="form-control" id="note-${n}" oninput="calcCash()" placeholder="0"><span class="ms-3 fw-bold text-end" style="min-width:80px" id="res-${n}">₹0</span></div>`).join("")}</div>
        <div class="col-md-6 text-center border-start"><h5 class="text-muted mt-3">Total Amount</h5><h1 class="display-4 fw-bold text-success">₹<span id="grandTotal">0</span></h1><button class="btn btn-outline-primary mt-3" onclick="handlePrint()"><i class="fas fa-print me-2"></i>Print Receipt</button></div>
      </div>${PRIVACY}`,

    pdf: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-file-pdf me-2 text-danger"></i>Images to PDF</h3><button class="btn btn-sm btn-outline-danger" onclick="resetPDFTool()"><i class="fas fa-trash me-1"></i>Clear</button></div><hr>
      <input type="file" id="imageInput" multiple accept="image/*" class="form-control mb-3">
      <button class="btn btn-danger w-100 fw-bold" id="pdfBtn" onclick="generatePDF()"><i class="fas fa-magic me-2"></i>Generate PDF</button>${PRIVACY}`,

    resizer: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-id-card me-2 text-warning"></i>Exam Photo Resizer</h3><button class="btn btn-sm btn-outline-danger" onclick="resetResizer()"><i class="fas fa-redo me-1"></i>Reset</button></div><hr>
      <p class="text-muted small">SSC, UPSC, Bank Forms (20KB – 50KB)</p>
      <input type="file" id="resizeInput" accept="image/*" class="form-control mb-3" onchange="previewResize()">
      <div id="resPreview" class="mb-3"></div>
      <select id="targetSize" class="form-select mb-3">
        <option value="20">Under 20KB (Signature)</option>
        <option value="50" selected>Under 50KB (Photo)</option>
        <option value="100">Under 100KB</option>
      </select>
      <button class="btn btn-warning w-100 fw-bold" onclick="smartResize()"><i class="fas fa-download me-2"></i>Download Perfect Size</button>${PRIVACY}`,

    merge: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-object-group me-2 text-primary"></i>Merge PDF</h3><button class="btn btn-sm btn-outline-danger" onclick="resetTool('merge',this)"><i class="fas fa-redo me-1"></i>Reset</button></div><hr>
      <input type="file" id="mergeInput" accept="application/pdf" multiple class="form-control mb-3">
      <button class="btn btn-primary w-100 fw-bold" id="mergeBtn" onclick="mergePDFs()"><i class="fas fa-layer-group me-2"></i>Merge & Download</button>${PRIVACY}`,

    split: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-cut me-2 text-warning"></i>Split PDF</h3><button class="btn btn-sm btn-outline-danger" onclick="resetTool('split',this)"><i class="fas fa-redo me-1"></i>Reset</button></div><hr>
      <input type="file" id="splitInput" accept="application/pdf" class="form-control mb-3">
      <div class="row mb-3"><div class="col"><label class="small fw-bold">From Page</label><input type="number" id="startPage" class="form-control" placeholder="1"></div><div class="col"><label class="small fw-bold">To Page</label><input type="number" id="endPage" class="form-control" placeholder="3"></div></div>
      <button class="btn btn-warning w-100 fw-bold" id="splitBtn" onclick="splitPDF()"><i class="fas fa-file-export me-2"></i>Split & Download</button>${PRIVACY}`,

    compress: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-compress-arrows-alt me-2 text-info"></i>Image Compressor</h3><button class="btn btn-sm btn-outline-danger" onclick="resetCompressor()"><i class="fas fa-trash me-1"></i>Clear</button></div><hr>
      <div class="row">
        <div class="col-md-6">
          <input type="file" id="compressInput" accept="image/*" class="form-control mb-3" onchange="previewImage()">
          <label class="form-label fw-bold">Quality: <span id="qValue" class="text-primary">70%</span></label>
          <input type="range" id="qualityRange" class="form-range" min="0.1" max="1.0" step="0.1" value="0.7" oninput="updateQDisplay(this.value)">
        </div>
        <div class="col-md-6 text-center border-start">
          <div id="previewArea" class="mb-3 border rounded p-2 text-muted" style="min-height:150px">Preview</div>
          <button class="btn btn-info w-100 text-white fw-bold" onclick="compressImage()"><i class="fas fa-download me-2"></i>Compress & Download</button>
        </div>
      </div>${PRIVACY}`,

    qrcode: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-qrcode me-2"></i>QR Generator</h3><button class="btn btn-sm btn-outline-danger" onclick="resetQR()"><i class="fas fa-trash me-1"></i>Clear</button></div><hr>
      <input type="text" id="qrText" class="form-control mb-3" placeholder="Enter URL or text...">
      <button class="btn btn-dark w-100 fw-bold" onclick="generateQR()"><i class="fas fa-qrcode me-2"></i>Generate QR Code</button>
      <div id="qrResult" class="text-center mt-4"></div>${PRIVACY}`,

    pdfToImg: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-images me-2 text-info"></i>PDF to Image</h3><button class="btn btn-sm btn-outline-danger" onclick="resetPdfToImg()"><i class="fas fa-trash me-1"></i>Clear</button></div><hr>
      <input type="file" id="pdfInput" accept="application/pdf" class="form-control mb-3">
      <button class="btn btn-info w-100 fw-bold text-white mb-2" id="pdfImgBtn" onclick="convertPdfToImg()"><i class="fas fa-images me-2"></i>Extract All Pages</button>
      <button class="btn btn-success w-100 fw-bold d-none" id="downloadAllBtn" onclick="downloadAllAsZip()"><i class="fas fa-file-archive me-2"></i>Download All as ZIP</button>
      <div id="pdfPreview" class="row g-3 mt-3"></div>${PRIVACY}`,

    voice: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-volume-up me-2 text-warning"></i>AI Voice Reader</h3><button class="btn btn-sm btn-outline-danger" onclick="resetVoice()"><i class="fas fa-trash me-1"></i>Clear</button></div><hr>
      <div id="uploadZone" class="border p-4 text-center rounded bg-light mb-3" onclick="document.getElementById('pdfInputVoice').click()" style="cursor:pointer;border:2px dashed #ffc107!important">
        <i class="fas fa-file-pdf fa-2x text-danger mb-2"></i><p class="mb-0 fw-bold">Click to Upload PDF</p>
        <input type="file" id="pdfInputVoice" hidden accept="application/pdf" onchange="processVoicePDF(this.files[0])">
      </div>
      <div class="row g-2 mb-3">
        <div id="pageSelectCol" class="col-6 d-none"><label class="small fw-bold">Page:</label><select id="pageSelect" class="form-select form-select-sm" onchange="stopVoice()"></select></div>
        <div class="col"><label class="small fw-bold">Speed:</label><select id="voiceSpeed" class="form-select form-select-sm"><option value="0.8">Slow</option><option value="1" selected>Normal</option><option value="1.2">Fast</option><option value="1.5">Very Fast</option></select></div>
      </div>
      <div id="manualText"><textarea id="speechText" class="form-control mb-3" rows="4" placeholder="Or type/paste text here..."></textarea></div>
      <div class="form-check form-switch mb-3" id="autoNextDiv"><input class="form-check-input" type="checkbox" id="autoNext" checked><label class="form-check-label small fw-bold" for="autoNext">Auto-read all pages</label></div>
      <div class="d-flex gap-2">
        <button id="mainPlayBtn" class="btn btn-warning px-4 fw-bold flex-fill" onclick="playVoice()"><i class="fas fa-play me-1"></i>Play</button>
        <button class="btn btn-secondary px-3" onclick="pauseVoice()"><i class="fas fa-pause"></i></button>
        <button class="btn btn-danger px-3" onclick="stopVoice()"><i class="fas fa-stop"></i></button>
      </div>${PRIVACY}`,

    age: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-birthday-cake me-2 text-danger"></i>Age Calculator</h3><button class="btn btn-sm btn-outline-danger" onclick="openTool('age')"><i class="fas fa-redo me-1"></i>Reset</button></div><hr>
      <div class="row g-3">
        <div class="col-md-6"><label class="form-label fw-bold">Date of Birth</label><input type="date" id="dob" class="form-control form-control-lg border-primary"></div>
        <div class="col-md-6"><label class="form-label fw-bold">Age at Date of</label><input type="date" id="todayDate" class="form-control form-control-lg" value="${new Date().toISOString().split("T")[0]}"></div>
        <div class="col-12"><button class="btn btn-primary w-100 py-3 fw-bold" onclick="calculateAge()"><i class="fas fa-calculator me-2"></i>Calculate Age</button></div>
      </div>
      <div id="ageResult" class="mt-4 d-none">
        <div class="card border-0 bg-light shadow-sm mb-3 text-center p-3"><h5 class="text-muted">Your Age</h5><h2 class="display-5 fw-bold text-primary" id="mainAge">--</h2><p class="mb-0" id="extraAge">--</p></div>
        <div class="row g-2 text-center">
          <div class="col-4"><div class="p-2 border rounded bg-white small"><b>Months</b><br><span id="totalMonths">--</span></div></div>
          <div class="col-4"><div class="p-2 border rounded bg-white small"><b>Weeks</b><br><span id="totalWeeks">--</span></div></div>
          <div class="col-4"><div class="p-2 border rounded bg-white small"><b>Days</b><br><span id="totalDays">--</span></div></div>
        </div>
      </div>${PRIVACY}`,

    wordToPdf: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-file-word me-2 text-primary"></i>Word to PDF</h3><button class="btn btn-sm btn-outline-danger" onclick="openTool('wordToPdf')"><i class="fas fa-redo me-1"></i>Reset</button></div><hr>
      <div id="dropZone" class="border p-5 text-center rounded bg-light mb-3" onclick="document.getElementById('docInput').click()" style="cursor:pointer;border:2px dashed #0d6efd!important">
        <i class="fas fa-file-import fa-3x text-primary mb-2"></i><h5 class="fw-bold">Select .docx File</h5>
        <input type="file" id="docInput" hidden accept=".docx" onchange="convertWordToPdf(this.files[0])">
      </div>
      <div id="previewContainer" class="d-none">
        <div class="alert alert-success"><i class="fas fa-check-circle me-2"></i>File Ready!</div>
        <div id="wordPreview" class="p-3 border bg-white mb-3 shadow-sm" style="max-height:400px;overflow-y:auto;font-family:serif;line-height:1.6"></div>
        <button id="downloadPdfBtn" class="btn btn-primary w-100 btn-lg fw-bold" onclick="downloadGeneratedPDF()"><i class="fas fa-file-pdf me-2"></i>Download as PDF</button>
      </div>${PRIVACY}`,

    pdfToWord: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-file-alt me-2 text-info"></i>PDF to Text</h3></div><hr>
      <div id="pdfUploadZone" class="border p-5 text-center rounded bg-light mb-3" onclick="document.getElementById('pdfFormatInput').click()" style="cursor:pointer;border:2px dashed #17a2b8!important">
        <i class="fas fa-file-import fa-3x text-info mb-2"></i><h5>Select PDF File</h5>
        <input type="file" id="pdfFormatInput" hidden accept="application/pdf" onchange="processFormatPDF(this.files[0])">
      </div>
      <div id="editorZone" class="d-none">
        <textarea id="pdfEditor" class="form-control mb-3" rows="12" placeholder="Extracted text will appear here..."></textarea>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary w-50" onclick="openTool('pdfToWord')">Cancel</button>
          <button class="btn btn-info w-50 text-white fw-bold" onclick="downloadFormattedPDF()"><i class="fas fa-download me-2"></i>Download Text</button>
        </div>
      </div>${PRIVACY}`,

    gst: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-file-invoice-dollar me-2 text-success"></i>GST Calculator</h3><button class="btn btn-sm btn-outline-danger" onclick="resetGST()"><i class="fas fa-redo me-1"></i>Reset</button></div><hr>
      <div class="card border-0 bg-light p-4 mb-3 shadow-sm">
        <div class="row g-3">
          <div class="col-12"><label class="form-label fw-bold">Amount (₹)</label><input type="number" id="gstAmount" class="form-control form-control-lg" placeholder="e.g. 10000"></div>
          <div class="col-12">
            <label class="form-label fw-bold">GST Rate</label>
            <div class="btn-group w-100">
              <input type="radio" class="btn-check" name="gstRate" id="r5" value="5"><label class="btn btn-outline-primary" for="r5">5%</label>
              <input type="radio" class="btn-check" name="gstRate" id="r12" value="12"><label class="btn btn-outline-primary" for="r12">12%</label>
              <input type="radio" class="btn-check" name="gstRate" id="r18" value="18" checked><label class="btn btn-outline-primary" for="r18">18%</label>
              <input type="radio" class="btn-check" name="gstRate" id="r28" value="28"><label class="btn btn-outline-primary" for="r28">28%</label>
            </div>
          </div>
          <div class="col-6"><button onclick="calculateGST(true)" class="btn btn-success w-100 py-3 fw-bold">Add GST</button></div>
          <div class="col-6"><button onclick="calculateGST(false)" class="btn btn-outline-success w-100 py-3 fw-bold">Remove GST</button></div>
        </div>
      </div>
      <div id="gstResult" class="d-none">
        <div class="card border-success p-3 shadow-sm">
          <div class="d-flex justify-content-between mb-2"><span>Net Amount:</span><span class="fw-bold">₹<span id="resNet">0</span></span></div>
          <div class="d-flex justify-content-between mb-2"><span>CGST:</span><span class="text-muted">₹<span id="resCGST">0</span></span></div>
          <div class="d-flex justify-content-between mb-2"><span>SGST:</span><span class="text-muted">₹<span id="resSGST">0</span></span></div>
          <hr><div class="d-flex justify-content-between"><span class="h5 fw-bold">Total:</span><span class="h5 fw-bold text-success">₹<span id="resTotal">0</span></span></div>
        </div>
      </div>${PRIVACY}`,

    removePages: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-file-signature me-2 text-danger"></i>Remove PDF Pages</h3><button class="btn btn-sm btn-outline-danger" onclick="openTool('removePages')"><i class="fas fa-redo me-1"></i>Reset</button></div><hr>
      <input type="file" id="removePdfInput" accept="application/pdf" class="form-control mb-3" onchange="previewPdfPages(this.files[0])">
      <div id="pagePreviewGrid" class="row g-2 mb-3"></div>
      <button class="btn btn-danger w-100 fw-bold d-none" id="removeBtn" onclick="handleRemovePages()"><i class="fas fa-trash me-2"></i>Remove Selected & Download</button>${PRIVACY}`,

    // ===== NEW TOOLS =====
    wordCounter: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-font me-2" style="color:#f093fb"></i>Word Counter</h3><button class="btn btn-sm btn-outline-danger" onclick="document.getElementById('wcText').value='';updateWordCount()"><i class="fas fa-trash me-1"></i>Clear</button></div><hr>
      <textarea id="wcText" class="form-control mb-3" rows="8" placeholder="Paste or type your text here..." oninput="updateWordCount()"></textarea>
      <div class="row g-2 text-center" id="wcStats">
        <div class="col-6 col-md-3"><div class="p-3 bg-light rounded border"><div class="h4 fw-bold text-primary" id="wcWords">0</div><div class="small text-muted">Words</div></div></div>
        <div class="col-6 col-md-3"><div class="p-3 bg-light rounded border"><div class="h4 fw-bold text-success" id="wcChars">0</div><div class="small text-muted">Characters</div></div></div>
        <div class="col-6 col-md-3"><div class="p-3 bg-light rounded border"><div class="h4 fw-bold text-warning" id="wcSentences">0</div><div class="small text-muted">Sentences</div></div></div>
        <div class="col-6 col-md-3"><div class="p-3 bg-light rounded border"><div class="h4 fw-bold text-danger" id="wcReadTime">0</div><div class="small text-muted">Min Read</div></div></div>
      </div>${PRIVACY}`,

    password: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-key me-2 text-warning"></i>Password Generator</h3></div><hr>
      <div class="card border-0 bg-light p-4 shadow-sm mb-3">
        <div class="input-group mb-3">
          <input type="text" id="pwdOutput" class="form-control form-control-lg fw-bold font-monospace" readonly placeholder="Click Generate...">
          <button class="btn btn-outline-secondary" onclick="copyPassword()" title="Copy"><i class="fas fa-copy"></i></button>
        </div>
        <label class="form-label fw-bold">Length: <span id="pwdLenVal">16</span></label>
        <input type="range" id="pwdLen" class="form-range mb-3" min="8" max="64" value="16" oninput="document.getElementById('pwdLenVal').textContent=this.value">
        <div class="row g-2 mb-3">
          <div class="col-6"><div class="form-check"><input class="form-check-input" type="checkbox" id="pwdUpper" checked><label class="form-check-label small" for="pwdUpper">Uppercase (A-Z)</label></div></div>
          <div class="col-6"><div class="form-check"><input class="form-check-input" type="checkbox" id="pwdLower" checked><label class="form-check-label small" for="pwdLower">Lowercase (a-z)</label></div></div>
          <div class="col-6"><div class="form-check"><input class="form-check-input" type="checkbox" id="pwdNum" checked><label class="form-check-label small" for="pwdNum">Numbers (0-9)</label></div></div>
          <div class="col-6"><div class="form-check"><input class="form-check-input" type="checkbox" id="pwdSym" checked><label class="form-check-label small" for="pwdSym">Symbols (!@#$)</label></div></div>
        </div>
        <button class="btn btn-warning w-100 fw-bold py-3" onclick="generatePassword()"><i class="fas fa-sync me-2"></i>Generate Password</button>
      </div>
      <div id="pwdStrength" class="d-none"><div class="d-flex align-items-center gap-2"><span class="small fw-bold">Strength:</span><div class="progress flex-fill" style="height:8px"><div id="pwdStrBar" class="progress-bar" style="width:0%"></div></div><span id="pwdStrLabel" class="small fw-bold"></span></div></div>${PRIVACY}`,

    base64: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-code me-2" style="color:#8e2de2"></i>Base64 Encoder / Decoder</h3></div><hr>
      <textarea id="b64Input" class="form-control mb-3" rows="5" placeholder="Enter text to encode or Base64 to decode..."></textarea>
      <div class="d-flex gap-2 mb-3">
        <button class="btn btn-primary flex-fill fw-bold" onclick="doBase64('encode')"><i class="fas fa-lock me-2"></i>Encode</button>
        <button class="btn btn-outline-primary flex-fill fw-bold" onclick="doBase64('decode')"><i class="fas fa-unlock me-2"></i>Decode</button>
      </div>
      <div id="b64Result" class="d-none">
        <label class="form-label fw-bold">Result:</label>
        <div class="input-group">
          <textarea id="b64Output" class="form-control font-monospace" rows="4" readonly></textarea>
          <button class="btn btn-outline-secondary" onclick="navigator.clipboard.writeText(document.getElementById('b64Output').value);showNotify('info','Copied!')"><i class="fas fa-copy"></i></button>
        </div>
      </div>${PRIVACY}`,

    unitConverter: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-ruler-combined me-2 text-teal"></i>Unit Converter</h3></div><hr>
      <div class="mb-3">
        <label class="form-label fw-bold">Category</label>
        <select id="ucCategory" class="form-select mb-3" onchange="updateUnitOptions()">
          <option value="length">Length</option>
          <option value="weight">Weight</option>
          <option value="temperature">Temperature</option>
          <option value="area">Area</option>
          <option value="speed">Speed</option>
        </select>
      </div>
      <div class="row g-3">
        <div class="col-md-5"><label class="form-label fw-bold">From</label><select id="ucFrom" class="form-select mb-2"></select><input type="number" id="ucValue" class="form-control" placeholder="Enter value" oninput="convertUnit()"></div>
        <div class="col-md-2 text-center d-flex align-items-end justify-content-center pb-2"><i class="fas fa-exchange-alt fa-2x text-muted"></i></div>
        <div class="col-md-5"><label class="form-label fw-bold">To</label><select id="ucTo" class="form-select mb-2"></select><input type="text" id="ucResult" class="form-control bg-light fw-bold" readonly placeholder="Result"></div>
      </div>${PRIVACY}`,

    loremIpsum: `${BACK}
      <div class="tool-header"><h3><i class="fas fa-align-left me-2" style="color:#f7971e"></i>Lorem Ipsum Generator</h3></div><hr>
      <div class="row g-3 mb-3">
        <div class="col-md-4"><label class="form-label fw-bold">Type</label><select id="loremType" class="form-select"><option value="paragraphs">Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option></select></div>
        <div class="col-md-4"><label class="form-label fw-bold">Count</label><input type="number" id="loremCount" class="form-control" value="3" min="1" max="50"></div>
        <div class="col-md-4 d-flex align-items-end"><button class="btn btn-warning w-100 fw-bold" onclick="generateLorem()"><i class="fas fa-magic me-2"></i>Generate</button></div>
      </div>
      <div id="loremResult" class="d-none">
        <div class="input-group">
          <textarea id="loremOutput" class="form-control" rows="10" readonly></textarea>
          <button class="btn btn-outline-secondary" onclick="navigator.clipboard.writeText(document.getElementById('loremOutput').value);showNotify('info','Copied!')"><i class="fas fa-copy"></i></button>
        </div>
      </div>${PRIVACY}`,
  };

  container.innerHTML = tpl[name] || `${BACK}<div class="text-center py-5"><i class="fas fa-tools fa-3x text-muted mb-3"></i><h5>Tool not found</h5></div>`;

  // Post-render init
  if (name === "unitConverter") updateUnitOptions();
}
