pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
let pdfPagesText = [];
let currentSpeech = null;
let isPaused = false;
const loadedScripts = new Set();
function loadScript(src) {
  if (loadedScripts.has(src)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => {
      loadedScripts.add(src);
      resolve();
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function updateDynamicTitle(toolName) {
  let newTitle = "SwiftTool Pro - Free Online Digital Toolkit & PDF Tools";
  let metaDesc = "SwiftTool Pro offers free, secure, and fast digital tools like Image Resizer for SSC/UPSC, Cash Counter, PDF Converter, and AI Voice. No file uploads, 100% private.";

  // Tool wise Title and Description logic
  if (toolName === "cash") {
    newTitle = "Online Cash Counter & Denomination Calculator | SwiftTool Pro";
    metaDesc = "Calculate total cash with Indian currency denominations (₹2000 to ₹1). Generate and print professional cash receipts instantly for banks and shops.";
  } 
  else if (toolName === "resizer") {
    newTitle = "Exam Photo Resizer (20KB - 50KB) for SSC, UPSC, Bank | SwiftTool Pro";
    metaDesc = "Perfectly resize your photos and signatures for SSC, UPSC, and IBPS exams. Compress to 20KB or 50KB with standard 350x450 dimensions without quality loss.";
  } 
  else if (toolName === "age") {
    newTitle = "Accurate Age Calculator by Date of Birth - Exact Age | SwiftTool Pro";
    metaDesc = "Calculate your exact age in years, months, and days. Perfect for government job forms and calculating age eligibility for exams like SSC and UPSC.";
  } 
  else if (toolName === "pdf") {
    newTitle = "Images to PDF Converter - High Quality & Secure | SwiftTool Pro";
    metaDesc = "Convert JPG, PNG, and WEBP images into a single high-quality PDF document. Fast, free, and works entirely in your browser for 100% privacy.";
  } 
  else if (toolName === "compress") {
    newTitle = "Compress Image to 20KB & 50KB Online - Quality Optimizer | SwiftTool Pro";
    metaDesc = "Reduce image file size online without losing clarity. Best tool for optimizing photos for web use and online application forms.";
  } 
  else if (toolName === "qrcode") {
    newTitle = "Free QR Code Generator for Text, URL & Contact | SwiftTool Pro";
    metaDesc = "Create custom QR codes for your website, business cards, or personal use for free. Instant download and high-resolution scan-ready QR codes.";
  } 
  else if (toolName === "pdfToImg") {
    newTitle = "PDF to Image Converter Online - Extract High-Res JPG | SwiftTool Pro";
    metaDesc = "Convert PDF pages into high-quality JPEG/PNG images. Secure browser-based conversion—no files are uploaded to our servers.";
  } 
  else if (toolName === "voice") {
    newTitle = "AI Voice - Free Text to Speech Online | SwiftTool Pro";
    metaDesc = "Convert your written text into a clear AI-powered human voice. Perfect for creating voiceovers and listening to long documents.";
  }
  else if (toolName === "merge") {
    newTitle = "Merge PDF Files Online - Combine PDF Fast | SwiftTool Pro";
    metaDesc = "Combine multiple PDF documents into one single file securely. Our PDF merger works offline in your browser for maximum data safety.";
  }
  else if (toolName === "split") {
    newTitle = "Split PDF Pages - Extract Specific Pages Online | SwiftTool Pro";
    metaDesc = "Extract pages from your PDF file or split one PDF into multiple documents instantly. Fast, free, and secure PDF splitting tool.";
  }

  // --- Update Document Title ---
  document.title = newTitle;

  // --- Update Meta Description for SEO ---
  let metaDescriptionTag = document.querySelector('meta[name="description"]');
  if (metaDescriptionTag) {
    metaDescriptionTag.setAttribute("content", metaDesc);
  } else {
    // Agar meta tag nahi hai toh naya bana dega
    let newMeta = document.createElement('meta');
    newMeta.name = "description";
    newMeta.content = metaDesc;
    document.head.appendChild(newMeta);
  }

  console.log("SEO Updated: " + newTitle);
}

function showNotify(type, message) {
  if (type === "success") {
    Swal.fire({
      icon: "success",
      title: "Done!",
      text: message,
      confirmButtonColor: "#28a745",
    });
  } else if (type === "error") {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: message,
      confirmButtonColor: "#dc3545",
    });
  } else {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
    Toast.fire({ icon: "info", title: message });
  }
}

function openTool(toolName) {
  const toolsGrid = document.getElementById("toolsGrid");
  const seoSection = document.getElementById("seoSection");
  const activeTool = document.getElementById("activeTool");
  const toolUI = document.getElementById("toolUI");

  history.pushState({ tool: toolName }, "");

  updateDynamicTitle(toolName);

  // Purana content gayab karo (Fade out)
  toolsGrid.classList.add("d-none");
  if (seoSection) seoSection.classList.add("d-none");

  // Naya tool dikhao
  activeTool.classList.remove("d-none");
  toolUI.innerHTML = ""; // Purana kachra saaf

  renderToolContent(toolName, toolUI); // Tool ka HTML load karo
}

function renderToolContent(toolName, container) {
  let content = "";
  const commonHeader = "";

  if (toolName === "cash") {
    content =
      commonHeader +
      `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="fas fa-calculator me-2 text-success"></i>Cash Counter</h3>
                <button class="btn btn-sm btn-outline-danger" onclick="resetCash()"><i class="fas fa-redo me-1"></i> Reset</button>
            </div><hr>
            <div class="row">
                <div class="col-md-6">
                    ${[2000, 500, 200, 100, 50, 20, 10, 5, 2, 1]
                      .map(
                        (note) => `
                        <div class="d-flex align-items-center mb-2">
                            <span class="fw-bold w-25">₹${note}</span>
                            <input type="number" class="form-control note-input" id="note-${note}" oninput="calcCash()" placeholder="0">
                            <span class="ms-3 fw-bold text-end" style="min-width:80px" id="res-${note}">₹0</span>
                        </div>`,
                      )
                      .join("")}
                </div>
                <div class="col-md-6 text-center border-start">
                    <h4 class="text-muted">Total Amount</h4>
                    <h1 class="display-4 fw-bold text-success">₹<span id="grandTotal">0</span></h1>
                    <button class="btn btn-outline-primary mt-3" onclick="handlePrint()"><i class="fas fa-print me-2"></i>Print Receipt</button>
                </div>
            </div> 
            <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-success"><i class="fas fa-coins me-2"></i> Online Cash Counter & Denomination Calculator</h5>
    <p class="small text-muted">SwiftTool Pro's Cash Counter helps you calculate total currency value instantly. Perfect for shopkeepers, bank deposits, and daily accounting. 
    <strong>Key Features:</strong> Supports all Indian denominations (₹2000 to ₹1), real-time calculation, and professional print-ready receipts.</p>
</div>
            `;
  } else if (toolName === "pdf") {
    content =
      commonHeader +
      `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="fas fa-file-pdf me-2 text-danger"></i>Images to PDF</h3>
                <button class="btn btn-sm btn-outline-danger" onclick="resetPDFTool()"><i class="fas fa-trash me-1"></i> Clear</button>
            </div><hr>
            <div class="text-center p-5 border border-dashed rounded bg-light">
                <input type="file" id="imageInput" multiple accept="image/*" class="form-control mb-3">
                <button class="btn btn-danger btn-lg w-100" id="pdfBtn" onclick="generatePDF()"><i class="fas fa-magic me-2"></i>Generate PDF</button>
            </div>
            <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
                <h5 class="fw-bold text-danger"><i class="fas fa-file-pdf me-2"></i> Professional Image to PDF Converter</h5>
                <p class="small text-muted">Convert JPG, PNG, or WEBP images into a single high-quality PDF document instantly.</p>
            </div>
            <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-info"><i class="fas fa-file-image me-2"></i> High-Quality PDF to JPG Converter</h5>
    <p class="small text-muted">Convert each page of your PDF document into separate high-resolution images. 
    <strong>Why use this?</strong> No software installation needed, works offline in your browser, and preserves the original quality of your documents.</p>
</div>
            `;
  } else if (toolName === "resizer") {
    content =
      commonHeader +
      `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="fas fa-expand-arrows-alt me-2 text-warning"></i>Exam Photo Resizer</h3>
                <button class="btn btn-sm btn-outline-danger" onclick="resetResizer()"><i class="fas fa-redo me-1"></i> Reset</button>
            </div><hr>
            <div class="text-center">
                <p class="text-muted small">SSC, UPSC, Bank Forms (20KB - 50KB)</p>
                <input type="file" id="resizeInput" accept="image/*" class="form-control mb-3" onchange="previewResize()">
                <div id="resPreview" class="mb-3"></div>
                <select id="targetSize" class="form-select mb-3">
                    <option value="20">Target: Under 20KB (Signature)</option>
                    <option value="50" selected>Target: Under 50KB (Photo)</option>
                    <option value="100">Target: Under 100KB</option>
                </select>
                <button class="btn btn-warning w-100 fw-bold" onclick="smartResize()">Download Perfect Size</button>
                <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
                    <h5 class="fw-bold text-warning"><i class="fas fa-id-badge me-2"></i> Online Exam Photo Resizer</h5>
                    <p class="small text-muted">Automatically adjusts your photo to 350x450 pixels and ensures the file size stays under the required limit. 
                    <strong>Note:</strong> Perfect for SSC GD, UPSC, and IBPS applications where strict file size is mandatory.</p>
                </div>
            </div>`;
  } else if (toolName === "merge") {
    content =
      commonHeader +
      `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="fas fa-object-group me-2 text-primary"></i>Merge PDF</h3>
                <button class="btn btn-sm btn-outline-danger" onclick="resetTool('merge', this)"><i class="fas fa-redo me-1"></i> Reset</button>
            </div><hr>
            <p class="text-muted small text-center">Combine multiple PDF files into one secure document.</p>
            <input type="file" id="mergeInput" accept="application/pdf" multiple class="form-control mb-3">
            <button class="btn btn-primary w-100 fw-bold" id="mergeBtn" onclick="mergePDFs()">
                <i class="fas fa-layer-group me-2"></i>Merge & Download PDF
            </button>
            <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
                <h5 class="fw-bold text-primary"><i class="fas fa-shield-alt me-2"></i> Private PDF Merger</h5>
                <p class="small text-muted">Merge PDFs locally in your browser. No server uploads, 100% data safety.</p>
            </div>`;
  } else if (toolName === "split") {
    content =
      commonHeader +
      `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="fas fa-cut me-2 text-warning"></i>Split PDF</h3>
                <button class="btn btn-sm btn-outline-danger" onclick="resetTool('split', this)"><i class="fas fa-redo me-1"></i> Reset</button>
            </div><hr>
            <input type="file" id="splitInput" accept="application/pdf" class="form-control mb-3">
            <div class="row mb-3">
                <div class="col"><label class="small fw-bold">From Page:</label><input type="number" id="startPage" class="form-control" placeholder="1"></div>
                <div class="col"><label class="small fw-bold">To Page:</label><input type="number" id="endPage" class="form-control" placeholder="3"></div>
            </div>
            <button class="btn btn-warning w-100 fw-bold" id="splitBtn" onclick="splitPDF()">
                <i class="fas fa-file-export me-2"></i>Split & Download
            </button>
            <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
                <h5 class="fw-bold text-warning"><i class="fas fa-cut me-2"></i> Fast Offline PDF Splitter</h5>
                <p class="small text-muted">Extract specific pages from your PDF instantly with complete security.</p>
            </div>`;
  } else if (toolName === "compress") {
    content =
      commonHeader +
      `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="fas fa-compress-arrows-alt me-2 text-primary"></i>Compressor</h3>
                <button class="btn btn-sm btn-outline-danger" onclick="resetCompressor()"><i class="fas fa-trash me-1"></i> Clear</button>
            </div><hr>
            <div class="row">
                <div class="col-md-6">
                    <input type="file" id="compressInput" accept="image/*" class="form-control mb-3" onchange="previewImage()">
                    <label class="form-label fw-bold">Quality: <span id="qValue" class="text-primary">70%</span></label>
                    <input type="range" id="qualityRange" class="form-range" min="0.1" max="1.0" step="0.1" value="0.7" oninput="updateQDisplay(this.value)">
                </div>
                <div class="col-md-6 text-center border-start">
                    <div id="previewArea" class="mb-3 border rounded p-2" style="min-height:150px">Preview</div>
                    <button class="btn btn-primary w-100" onclick="compressImage()">Compress & Download</button>
                </div>
            </div>
            <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-primary"><i class="fas fa-compress me-2"></i> Smart Image Optimizer</h5>
    <p class="small text-muted">Reduce image file size without losing quality. Adjust the quality slider to get the perfect balance between size and clarity. 
    <strong>Privacy:</strong> Your photos are never uploaded to any server; compression happens entirely on your device.</p>
</div>
            `;
  } else if (toolName === "qrcode") {
    content =
      commonHeader +
      `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="fas fa-qrcode me-2 text-dark"></i>QR Generator</h3>
                <button class="btn btn-sm btn-outline-danger" onclick="resetQR()"><i class="fas fa-trash me-1"></i> Reset</button>
            </div><hr>
            <input type="text" id="qrText" class="form-control mb-3" placeholder="Enter text or URL">
            <button class="btn btn-dark w-100" onclick="generateQR()">Generate QR Code</button>
            <div id="qrResult" class="text-center mt-4"></div>
            <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-dark"><i class="fas fa-qrcode me-2"></i> Free Custom QR Code Generator</h5>
    <p class="small text-muted">Generate unlimited QR codes for URLs, text, or contact details. Our tool creates clean, scannable QR codes instantly. 
    <strong>SEO Tip:</strong> Use these QR codes for business cards, marketing flyers, or personal websites for easy sharing.</p>
</div>
            `;
  } else if (toolName === "pdfToImg") {
    content =
      commonHeader +
      `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="fas fa-images me-2 text-info"></i>PDF to Image</h3>
                <button class="btn btn-sm btn-outline-danger" onclick="resetPdfToImg()"><i class="fas fa-trash me-1"></i> Clear</button>
            </div><hr>
            <input type="file" id="pdfInput" accept="application/pdf" class="form-control mb-3">
            <button class="btn btn-info w-100 fw-bold mb-2" id="pdfImgBtn" onclick="convertPdfToImg()">Extract All Pages</button>
            <button class="btn btn-success w-100 fw-bold d-none" id="downloadAllBtn" onclick="downloadAllAsZip()">Download All as ZIP</button>
            <div id="pdfPreview" class="row g-3 mt-4"></div>
            
            <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
                <h5 class="fw-bold text-info"><i class="fas fa-file-image me-2"></i> High-Resolution PDF to JPG Converter</h5>
                <p class="small text-muted">Our tool allows you to convert complex PDF pages into high-quality JPEG images instantly. 
                <strong>Privacy First:</strong> The conversion happens entirely in your browser. No files are uploaded to any server, keeping your sensitive documents 100% private.</p>
                <p class="small text-muted mb-0"><strong>Why use this?</strong> Best for extracting charts, certificates, or snapshots from large PDF files without losing clarity.</p>
            </div>`;
  } else if (toolName === "voice") {
    content =
      commonHeader +
      `
      <div class="voice-container p-1">
          <div class="d-flex justify-content-between align-items-center mb-3">
              <h3><i class="fas fa-volume-up me-2 text-warning"></i>AI Voice & PDF Reader</h3>
              <button class="btn btn-sm btn-outline-danger" onclick="resetVoice()"><i class="fas fa-trash me-1"></i> Clear</button>
          </div><hr>
          
          <div id="uploadZone" class="border-dashed p-4 text-center rounded-3 bg-light mb-4" 
               onclick="document.getElementById('pdfInputVoice').click()" style="cursor:pointer; border: 2px dashed #ffc107;">
              <i class="fas fa-file-pdf fa-3x text-danger mb-2"></i>
              <p class="mb-0 fw-bold">Click to Upload Digital PDF</p>
              <small class="text-muted">(Reads English  Text)</small>
              <input type="file" id="pdfInputVoice" hidden accept="application/pdf" onchange="processVoicePDF(this.files[0])">
          </div>

          <div id="voiceControls" class="d-none mb-3 p-3 bg-white border rounded shadow-sm">
              <div class="row g-2 mb-3">
                  <div class="col-6 text-start">
                      <label class="small fw-bold">Select Page:</label>
                      <select id="pageSelect" class="form-select form-select-sm" onchange="stopVoice()"></select>
                  </div>
                  <div class="col-6 text-start">
                      <label class="small fw-bold">Speed:</label>
                      <select id="voiceSpeed" class="form-select form-select-sm">
                          <option value="0.8">Slow</option>
                          <option value="1" selected>Normal</option>
                          <option value="1.2">Fast</option>
                          <option value="1.5">Very Fast</option>
                      </select>
                  </div>
              </div>
              <div class="form-check form-switch mb-3 text-start">
                  <input class="form-check-input" type="checkbox" id="autoNext" checked>
                  <label class="form-check-label small fw-bold" for="autoNext">Auto-read all pages</label>
              </div>
              <div class="d-flex gap-2 justify-content-center">
                  <button class="btn btn-warning px-4 fw-bold" onclick="playVoice()"><i class="fas fa-play me-1"></i> Play</button>
                  <button class="btn btn-secondary px-4 fw-bold" onclick="pauseVoice()"><i class="fas fa-pause me-1"></i> Pause</button>
                  <button class="btn btn-danger px-4 fw-bold" onclick="stopVoice()"><i class="fas fa-stop me-1"></i> Stop</button>
              </div>
          </div>

          <div id="manualText">
              <label class="form-label fw-bold d-block text-start">Or Type/Paste Text:</label>
              <textarea id="speechText" class="form-control mb-3" rows="4" placeholder="Type here if you don't have a PDF..."></textarea>
              <button class="btn btn-outline-warning w-100 fw-bold" onclick="speakText()">Speak Manual Text</button>
          </div>

          <div class="mt-4 p-3 bg-light rounded border text-start">
              <h6 class="fw-bold text-warning"><i class="fas fa-info-circle me-2"></i> Important Note:</h6>
              <p class="small text-muted mb-0">This tool only reads <b>Digital PDFs</b>. Handwritten notes or images of book pages are not supported. Only  English languages are currently optimized.</p>
          </div>
      </div>`;
  } else if (toolName === "age") {
    content =
      commonHeader +
      `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="fas fa-birthday-cake me-2 text-danger"></i>Age Calculator</h3>
                <button class="btn btn-sm btn-outline-danger" onclick="openTool('age')"><i class="fas fa-redo me-1"></i> Reset</button>
            </div><hr>
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label fw-bold">Date of Birth</label>
                    <input type="date" id="dob" class="form-control form-control-lg border-primary">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold">Age at the Date of</label>
                    <input type="date" id="todayDate" class="form-control form-control-lg" value="${new Date().toISOString().split("T")[0]}">
                </div>
                <div class="col-12">
                    <button class="btn btn-primary w-100 py-3 fw-bold shadow-sm" onclick="calculateAge()">
                        <i class="fas fa-calculator me-2"></i> Calculate Exact Age
                    </button>
                </div>
            </div>
            <div id="ageResult" class="mt-4 d-none">
                <div class="card border-0 bg-light shadow-sm mb-3">
                    <div class="card-body text-center">
                        <h5 class="text-muted">Current Age</h5>
                        <h2 class="display-5 fw-bold text-primary" id="mainAge">--</h2>
                        <p class="mb-0 text-dark" id="extraAge">--</p>
                    </div>
                </div>
                <div class="row g-2 text-center">
                    <div class="col-4"><div class="p-2 border rounded bg-white small"><b>Months:</b><br><span id="totalMonths">--</span></div></div>
                    <div class="col-4"><div class="p-2 border rounded bg-white small"><b>Weeks:</b><br><span id="totalWeeks">--</span></div></div>
                    <div class="col-4"><div class="p-2 border rounded bg-white small"><b>Days:</b><br><span id="totalDays">--</span></div></div>
                </div>
            </div>
            <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-danger"><i class="fas fa-hourglass-half me-2"></i> Accurate Age Calculator by Date of Birth</h5>
    <p class="small text-muted">Calculate your exact age in years, months, and days. We also provide a breakdown in total weeks and days. 
    <strong>Useful for:</strong> Filling government job forms (SSC, UPSC), school admissions, and insurance applications.</p>
</div>
            `;
  }

  // Final rendering
  container.innerHTML = content;
}

function resetTool(toolName, btn) {
  const icon = btn.querySelector("i");
  icon.classList.add("spin-animation"); // Icon ko ghumao

  setTimeout(() => {
    openTool(toolName); // Tool refresh karo
    showNotify("info", "Tool Reseted!");
  }, 500);
}

// Result ke sath ad refresh karne ke liye
if (window.collectgarbages) {
  window.collectgarbages();
} // Reset trigger
// --- 3. CORE FUNCTIONALITIES ---

// Cash Counter Logic
function calcCash() {
  let grandTotal = 0;
  [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1].forEach((note) => {
    const qty = document.getElementById(`note-${note}`).value || 0;
    const total = qty * note;
    document.getElementById(`res-${note}`).innerText = `₹${total}`;
    grandTotal += total;
  });
  document.getElementById("grandTotal").innerText =
    grandTotal.toLocaleString("en-IN");
}
// --- Naya Helper Function ---
async function handlePrint() {
  const total = document.getElementById("grandTotal").innerText;
  if (total === "0" || total === "")
    return showNotify("error", "Amount is not should be 0!");

  // 1. Data tayyar karo
  let receiptContent = `
        <div style="text-align:center; font-family:Arial; padding:20px; border:1px solid #eee;">
            <h2>SwiftTool Pro - Cash Receipt</h2>
            <hr>
            <table style="width:100%; border-collapse:collapse; margin-top:20px;">
                <tr style="background:#f4f4f4;">
                    <th style="padding:10px; border:1px solid #ddd;">Note Value</th>
                    <th style="padding:10px; border:1px solid #ddd;">Count</th>
                    <th style="padding:10px; border:1px solid #ddd;">Total</th>
                </tr>`;

  // Sabhi notes ka data loop se nikalo
  [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1].forEach((note) => {
    const qty = document.getElementById(`note-${note}`).value || 0;
    if (qty > 0) {
      receiptContent += `
                <tr>
                    <td style="padding:8px; border:1px solid #ddd; text-align:center;">₹${note}</td>
                    <td style="padding:8px; border:1px solid #ddd; text-align:center;">${qty}</td>
                    <td style="padding:8px; border:1px solid #ddd; text-align:center;">₹${qty * note}</td>
                </tr>`;
    }
  });

  receiptContent += `
            </table>
            <h1 style="color:green; margin-top:30px;">Grand Total: ₹${total}</h1>
            <p style="margin-top:50px; font-size:12px; color:#888;">Generated on: ${new Date().toLocaleString()}</p>
        </div>`;

  // 2. Alert dikhao aur Ad kholo

  // 3. Print ke liye naya window kholo
  const printWin = window.open("", "_blank", "width=800,height=600");
  printWin.document.write(
    "<html><head><title>Print Receipt</title></head><body>",
  );
  printWin.document.write(receiptContent);
  printWin.document.write("</body></html>");
  printWin.document.close();

  // 4. Print command
  setTimeout(() => {
    printWin.print();
    printWin.close(); // Print ke baad auto-close
  }, 500);
}

// QR Code
async function generateQR() {
  const text = document.getElementById("qrText").value;
  if (!text.trim()) return showNotify("error", "Enter text/URL for QR!");

  const btn = document.querySelector("button[onclick*='generateQR']");
  btn.disabled = true;

  // 1. Pehle QR dikhao
  document.getElementById("qrResult").innerHTML = `
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(text)}" class="img-fluid shadow rounded">
        <p class="text-muted mt-2">QR Generated Successfully!</p>`;

  // 2. Ab User ko Ad wala loader dikhao (Task completion ke baad)

  btn.disabled = false;
  showNotify("success", "QR Code Ready!");
}


// --- 4. RESET & UTILS ---
function resetCash() {
  [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1].forEach((n) => {
    document.getElementById(`note-${n}`).value = "";
    document.getElementById(`res-${n}`).innerText = "₹0";
  });
  document.getElementById("grandTotal").innerText = "0";
  showNotify("info", "Counter Cleared");
}

function resetQR() {
  document.getElementById("qrText").value = "";
  document.getElementById("qrResult").innerHTML = "";
  showNotify("info", "QR Cleared");
}


function goBack() {
  document.getElementById("activeTool").classList.add("d-none");
  document.getElementById("extraScreens").classList.add("d-none");
  document.getElementById("toolsGrid").classList.remove("d-none");

  // Ye line zaroori hai description wapas dikhane ke liye
  if (document.getElementById("seoSection")) {
    document.getElementById("seoSection").classList.remove("d-none");
  }

  window.scrollTo(0, 0);
  document.title = "SwiftTool Pro - 20KB Image Compressor & Free PDF Tools";
}

function updateQDisplay(val) {
  document.getElementById("qValue").innerText = Math.round(val * 100) + "%";
}

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function previewImage() {
  const file = document.getElementById("compressInput").files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("previewArea").innerHTML =
        `<img src="${e.target.result}" class="img-fluid rounded" style="max-height:120px"><p class="small text-muted mt-2">${(file.size / 1024).toFixed(2)} KB</p>`;
    };
    reader.readAsDataURL(file);
  }
}

function showExtra(page) {
  history.pushState({ page: page }, "");
  document.getElementById("toolsGrid").classList.add("d-none");
  document.getElementById("activeTool").classList.add("d-none");
  document.getElementById("extraScreens").classList.remove("d-none");
  const content = document.getElementById("extraContent");

  if (page === "about") {
    content.innerHTML = `
      <div class="text-start p-3">
        <h2 class="fw-bold text-primary mb-4 text-center">About SwiftTool Pro</h2>
        <p class="lead">Welcome to <b>SwiftTool Pro</b>, a professional platform providing high-quality digital utility tools.</p>
        <p>Our mission is simple: to make complex digital tasks easy, fast, and secure. We specialize in web-based tools that help students and professionals handle daily tasks like document conversion and image optimization without downloading heavy software.</p>
        
        <h5 class="mt-4"><i class="fas fa-check-circle text-success me-2"></i>What We Offer:</h5>
        <ul>
            <li><b>Exam Ready Tools:</b> Specialized resizers for SSC, UPSC, and Banking exams.</li>
            <li><b>Document Management:</b> High-speed PDF to Image and Image to PDF conversion.</li>
            <li><b>Financial Utilities:</b> Simple and accurate Cash Counter for daily accounting.</li>
            <li><b>AI Powered Features:</b> QR generation and Text-to-Speech (AI Voice) capabilities.</li>
        </ul>

        <h5 class="mt-4"><i class="fas fa-shield-alt text-primary me-2"></i>Why Trust Us?</h5>
        <p>At SwiftTool Pro, we prioritize <b>User Privacy</b>. Unlike other online converters, we process all your data <b>locally in your browser</b>. Your photos, documents, and calculations never reach our servers, ensuring 100% data safety.</p>
        
        <div class="alert alert-info mt-4">
            Founded in 2026, we are committed to continuous improvement. For suggestions, visit our Contact page.
        </div>
      </div>`;
  } else if (page === "terms") {
    content.innerHTML = `
      <div class="text-start p-3">
        <h2 class="fw-bold text-dark mb-4 text-center">Privacy Policy & Terms</h2>
        <p class="small text-muted">Last Updated: February 2026</p>
        
        <h5 class="mt-4 text-primary">1. Privacy Commitment</h5>
        <p>At SwiftTool Pro, we do not collect, store, or share your personal files. All tools (Image Compressor, PDF Tools, etc.) work using <b>Client-Side JavaScript</b>. This means your files stay on your device.</p>

        <h5 class="mt-4 text-primary">2. Cookies and Ads</h5>
        <p>We use standard cookies to improve user experience. Our website serves advertisements through partners like <b>Google AdSense</b>. These third-party ad servers may use cookies to serve ads based on your prior visits to our website.</p>

        <h5 class="mt-4 text-primary">3. Terms of Service</h5>
        <ul>
            <li>The tools are provided "as-is" without any warranties.</li>
            <li>Users are responsible for verifying the final output of exam-related tools.</li>
            <li>SwiftTool Pro is free for personal use. Commercial automated scraping is prohibited.</li>
        </ul>

        <h5 class="mt-4 text-primary">4. Consent</h5>
        <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
      </div>`;
  } else if (page === "contact") {
    // Aapka Formspree wala contact code ekdum perfect hai, use waisa hi rehne dein
    // Bas email placeholder ko 'contact@swifttoolpro.com' kar dena professional look ke liye.
    content.innerHTML = `
        <h2 class="fw-bold text-danger mb-4">Contact Us</h2>
        <p class="text-muted">Have a query or need a new tool? Reach out to us.</p>
        <form id="contact-form" action="https://formspree.io/f/xbdayrne" method="POST">
            <div class="mb-3 text-start">
                <label class="form-label fw-bold">Full Name</label>
                <input type="text" name="name" class="form-control" placeholder="Your Name" required>
            </div>
            <div class="mb-3 text-start">
                <label class="form-label fw-bold">Email</label>
                <input type="email" name="email" class="form-control" placeholder="contact@yourdomain.com" required>
            </div>
            <div class="mb-3 text-start">
                <label class="form-label fw-bold">Message</label>
                <textarea name="message" class="form-control" rows="4" placeholder="How can we help?" required></textarea>
            </div>
            <button type="submit" id="form-submit" class="btn btn-danger w-100 fw-bold py-3">Send Message</button>
        </form>`;
    const form = document.getElementById("contact-form");
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = document.getElementById("form-submit");

      if (form.action.includes("https://formspree.io/f/xbdayrne")) {
        return Swal.fire(
          "Setup Required",
          "Please add your valid Formspree ID in script.js",
          "warning",
        );
      }
      btn.disabled = true;
      btn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          showNotify("success", "Thank you! Your message has been received.");
          form.reset();
        } else {
          showNotify("error", "Message could not be sent. Please try again.");
        }
      } catch (error) {
        showNotify("error", "Network error. Check your connection.");
      }

      btn.disabled = false;
      btn.innerHTML =
        '<i class="fas fa-paper-plane me-2"></i> Send Message Now';
    };
  }
}
window.onpopstate = function (event) {
  const activeTool = document.getElementById("activeTool");
  const extraScreens = document.getElementById("extraScreens");
  const toolsGrid = document.getElementById("toolsGrid");

  // Agar koi tool ya extra screen (About/Contact) khuli hai, toh dashboard dikhao
  if (
    !activeTool.classList.contains("d-none") ||
    !extraScreens.classList.contains("d-none")
  ) {
    // Dashboard wapas dikhane ka logic
    activeTool.classList.add("d-none");
    extraScreens.classList.add("d-none");
    toolsGrid.classList.remove("d-none");

    if (document.getElementById("seoSection")) {
      document.getElementById("seoSection").classList.remove("d-none");
    }

    window.scrollTo(0, 0);
  } else {
    // Agar user pehle se dashboard par hai aur back dabaye, toh hi exit ho
    history.back();
  }
};

async function calculateAge() {
  const dobValue = document.getElementById("dob").value;
  const targetValue = document.getElementById("todayDate").value;

  if (!dobValue)
    return showNotify("error", "Please select your Date of Birth!");

  const dob = new Date(dobValue);
  const today = new Date(targetValue);
  if (dob > today) return showNotify("error", "DOB cannot be in the future!");

  // Button loader set karein
  const btn = document.querySelector("button[onclick='calculateAge()']");
  const originalBtnText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2"></span>Wait...';

  // Yahan Ad wait karega

  // Ab calculation logic
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  // Result show karein
  document.getElementById("ageResult").classList.remove("d-none");
  document.getElementById("mainAge").innerText = `${years} Years`;
  document.getElementById("extraAge").innerText =
    `${months} Months | ${days} Days`;

  const diffTime = Math.abs(today - dob);
  document.getElementById("totalMonths").innerText = (
    years * 12 +
    months
  ).toLocaleString();
  document.getElementById("totalWeeks").innerText = Math.floor(
    diffTime / (1000 * 60 * 60 * 24 * 7),
  ).toLocaleString();
  document.getElementById("totalDays").innerText = Math.floor(
    diffTime / (1000 * 60 * 60 * 24),
  ).toLocaleString();

  // Button reset
  btn.disabled = false;
  btn.innerHTML = originalBtnText;

  showNotify("success", "Age Calculated!");
}

function resetPDFTool() {
  document.getElementById("imageInput").value = "";
  showNotify("info", "PDF Tool Cleared");
}

function resetCompressor() {
  document.getElementById("compressInput").value = "";
  document.getElementById("qualityRange").value = 0.7;
  document.getElementById("qValue").innerText = "70%";
  document.getElementById("previewArea").innerHTML = "Preview";
  showNotify("info", "Compressor Cleared");
}

// PDF to Image Reset
function resetPdfToImg() {
  document.getElementById("pdfInput").value = "";
  document.getElementById("pdfPreview").innerHTML = "";
  document.getElementById("downloadAllBtn").classList.add("d-none");
  showNotify("info", "PDF to Image Cleared");
}

// Exam Resizer Reset
function resetResizer() {
  const input = document.getElementById("resizeInput");
  if (input) input.value = "";
  const preview = document.getElementById("resPreview");
  if (preview) preview.innerHTML = "";
  document.getElementById("targetSize").value = "50";
  showNotify("info", "Resizer Cleared");
}
