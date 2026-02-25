pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

const openAd = () => {
  return new Promise((resolve) => {
    // Step 1: Check karo kya user VIP hai?

    // --- Ad logic for Non-VIP users starts here ---
    const loader = document.getElementById("loaderOverlay");
    const lastAdTime = localStorage.getItem("lastAdTime");
    const now = new Date().getTime();

    loader.classList.remove("d-none");

    setTimeout(() => {
      loader.classList.add("d-none");
      // 15 minute (900000 ms) wala gap check
      if (!lastAdTime || now - lastAdTime > 900000) {
        localStorage.setItem("lastAdTime", now);
        window.open(
          "https://www.effectivegatecpm.com/uhv7f7jam?key=621c144ec67a64c9e4ccf13b92fb867b",
          "_blank",
        );
      }
      resolve();
    }, 3000); // 3 second ka wait sirf non-vip ke liye
  });
};

// --- 1. Helper Function for Professional Alerts (SweetAlert2) ---

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

// --- 2. Tool Opening Logic ---
function openTool(toolName) {
  // 1. Browser history update (Back button ke liye)
  history.pushState({ page: "tool" }, "");

  // 2. Elements ko variables mein le lo
  const toolsGrid = document.getElementById("toolsGrid");
  const seoSection = document.getElementById("seoSection");
  const activeTool = document.getElementById("activeTool");
  const toolUI = document.getElementById("toolUI");

  // 3. Purana data saaf karo aur Dashboard hide karo
  toolsGrid.classList.add("d-none");
  if (seoSection) seoSection.classList.add("d-none");
  toolUI.innerHTML = ""; // Purane tool ka kachra saaf

  // 4. Tool container dikhao
  activeTool.classList.remove("d-none");
  activeTool.classList.add("animate__animated", "animate__fadeInUp");

  // 5. Page ko top par le jao (Most Important)
  window.scrollTo(0, 0);

  setTimeout(refreshNativeAd, 500);

  if (toolName === "cash") {
    toolUI.innerHTML = `
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
                            <input type="number" class="form-control note-input me-3" id="note-${note}" oninput="calcCash()" placeholder="0" min="0">
                            <span class="ms-3 fw-bold text-end" style="min-width:80px" id="res-${note}">₹0</span>
                        </div>`,
                      )
                      .join("")}
                </div>
                <div class="col-md-6 text-center border-start d-flex flex-column justify-content-center">
                    <h4 class="text-muted">Total Amount</h4>
                    <h1 class="display-4 fw-bold text-success">₹<span id="grandTotal">0</span></h1>
                   <button class="btn btn-outline-primary mt-3" onclick="handlePrint()">
    <i class="fas fa-print me-2"></i>Print Receipt
    </button>
                </div>
                <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-success"><i class="fas fa-info-circle me-2"></i> How to use Cash Counter?</h5>
    <p class="small text-muted">SwiftTool Pro's Cash Counter helps you calculate total currency fast. Simply enter the number of notes for each denomination (₹2000 to ₹1), and the tool will show the grand total in real-time. You can also print a professional receipt for your records.</p>
    </div>
            </div>`;
  } else if (toolName === "pdf") {
    toolUI.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="fas fa-file-pdf me-2 text-danger"></i>Images to PDF</h3>
                <button class="btn btn-sm btn-outline-danger" onclick="resetPDFTool()"><i class="fas fa-trash me-1"></i> Clear</button>
            </div><hr>
            <div class="text-center p-5 border border-dashed rounded bg-light">
                <input type="file" id="imageInput" multiple accept="image/*" class="form-control mb-3">
                <button class="btn btn-danger btn-lg w-100" id="pdfBtn" onclick="generatePDF()"><i class="fas fa-magic me-2"></i>Generate PDF</button>
                <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-danger"><i class="fas fa-file-pdf me-2"></i> Professional Image to PDF Converter</h5>
    <p class="small text-muted">Convert JPG, PNG, or WEBP images into a single high-quality PDF document instantly. Perfect for creating college assignments or office documents. Our tool maintains the original quality of your photos without any server upload.</p>
    </div>
            </div>`;
  } else if (toolName === "compress") {
    toolUI.innerHTML = `
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
                <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-primary"><i class="fas fa-compress-arrows-alt me-2"></i> Fast Online Image Compressor</h5>
    <p class="small text-muted">Reduce image file size instantly without losing quality. This tool is essential for uploading photos on government portals where specific size limits (like under 100KB) are required.</p>
    </div>
            </div>`;
  } else if (toolName === "qrcode") {
    toolUI.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="fas fa-qrcode me-2 text-dark"></i>QR Generator</h3>
                <button class="btn btn-sm btn-outline-danger" onclick="resetQR()"><i class="fas fa-trash me-1"></i> Reset</button>
            </div><hr>
            <input type="text" id="qrText" class="form-control mb-3" placeholder="Enter text or URL">
            <button class="btn btn-dark w-100" onclick="openAd(); generateQR()">Generate QR Code</button>
            <div id="qrResult" class="text-center mt-4">
            <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-dark"><i class="fas fa-qrcode me-2"></i> Free Instant QR Code Generator</h5>
    <p class="small text-muted">Create custom QR codes for your website URLs, text, or contact info. SwiftTool Pro provides a high-resolution QR generator that is 100% free and works instantly. Simply enter your text, and your QR code is ready to save.</p>
    </div>
            </div>`;
  } else if (toolName === "voice") {
    toolUI.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="fas fa-volume-up me-2 text-warning"></i>AI Voice</h3>
                <button class="btn btn-sm btn-outline-danger" onclick="resetVoice()"><i class="fas fa-trash me-1"></i> Clear</button>
            </div><hr>
            <textarea id="speechText" class="form-control mb-3" rows="4" placeholder="Type text here..."></textarea>
            <button class="btn btn-warning w-100 fw-bold" onclick="speakText()">Speak Now</button>
            <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-warning"><i class="fas fa-microphone-alt me-2"></i> AI-Powered Text to Speech</h5>
    <p class="small text-muted">Convert your written text into a clear AI voice. This tool uses advanced browser-based speech synthesis technology to read your content aloud. It's perfect for proofreading, accessibility, or creating audio snippets for your projects.</p>
    </div>
            `;
  } else if (toolName === "pdfToImg") {
    toolUI.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h3><i class="fas fa-images me-2 text-info"></i>PDF to Image</h3>
            <button class="btn btn-sm btn-outline-danger" onclick="resetPdfToImg()"><i class="fas fa-trash me-1"></i> Clear</button>
        </div><hr>
        <input type="file" id="pdfInput" accept="application/pdf" class="form-control mb-3">
        <button class="btn btn-info w-100 fw-bold mb-2" id="pdfImgBtn" onclick="convertPdfToImg()">Extract All Pages</button>
        
        <button class="btn btn-success w-100 fw-bold d-none" id="downloadAllBtn" onclick="downloadAllAsZip()">
            <i class="fas fa-file-archive me-2"></i>Download All as ZIP
        </button>
        <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-info"><i class="fas fa-images me-2"></i> High-Quality PDF to Image Extractor</h5>
    <p class="small text-muted">Extract every page of your PDF document into high-resolution JPG images. Our tool allows you to download pages individually or all at once in a convenient ZIP file. Everything happens locally in your browser, keeping your documents 100% private.</p>
    </div>

        <div id="pdfPreview" class="row g-3 mt-4"></div>`;
  } else if (toolName === "resizer") {
    toolUI.innerHTML = `
        <div class="text-center">
            <h3><i class="fas fa-expand-arrows-alt me-2 text-warning"></i>Exam Photo Resizer</h3>
            <p class="text-muted">SSC, UPSC, Bank Forms (20KB - 50KB)</p><hr>
            <input type="file" id="resizeInput" accept="image/*" class="form-control mb-3" onchange="previewResize()">
            <div id="resPreview" class="mb-3"></div>
            <select id="targetSize" class="form-select mb-3">
                <option value="20">Target: Under 20KB (Signature)</option>
                <option value="50" selected>Target: Under 50KB (Photo)</option>
                <option value="100">Target: Under 100KB</option>
            </select>
            <button class="btn btn-warning w-100 fw-bold" onclick="smartResize()">Download Perfect Size</button>
            <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-warning"><i class="fas fa-id-badge me-2"></i> Online Exam Photo Resizer (SSC, UPSC, IBPS)</h5>
    <p class="small text-muted">Easily resize your photos for government job applications. Our tool automatically adjusts your photo to 350x450 pixels and ensures the file size stays under 50KB or 20KB as per official guidelines.</p>
    </div>
        </div>`;
  } else if (toolName === "merge") {
    toolUI.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h3><i class="fas fa-object-group me-2 text-primary"></i>Merge PDF</h3>
            <button class="btn btn-sm btn-outline-danger" onclick="resetTool('merge', this)">
                <i class="fas fa-redo me-1"></i> Reset
            </button>
        </div><hr>
        <p class="text-muted small">Combine multiple PDF files into one secure document.</p>
        <input type="file" id="mergeInput" accept="application/pdf" multiple class="form-control mb-3">
        <button class="btn btn-primary w-100 fw-bold" id="mergeBtn" onclick="mergePDFs()">
            <i class="fas fa-layer-group me-2"></i>Merge & Download PDF
        </button>
        
        <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
            <h5 class="fw-bold text-primary"><i class="fas fa-shield-alt me-2"></i> Private PDF Merger</h5>
            <p class="small text-muted">SwiftTool Pro merges your PDFs locally. Unlike iLovePDF, we don't upload your files to any server. Your privacy is our priority.</p>
        </div>`;
  } else if (toolName === "split") {
    toolUI.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h3><i class="fas fa-cut me-2 text-warning"></i>Split PDF</h3>
            <button class="btn btn-sm btn-outline-danger" onclick="resetTool('split', this)">
                <i class="fas fa-redo me-1"></i> Reset
            </button>
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
            <p class="small text-muted">Extract specific pages from your PDF instantly. All processing happens in your browser for 100% data security.</p>
        </div>`;
  } else if (toolName === "age") {
    toolUI.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="fas fa-birthday-cake me-2 text-danger"></i>Age Calculator</h3>
                <button class="btn btn-sm btn-outline-danger" onclick="openTool('age')"><i class="fas fa-redo me-1"></i> Reset</button>
            </div><hr>

            <div class="text-center mb-4 ad-slot" style="min-height:90px; background: #f8f9fa; border: 1px dashed #ddd;">
                 <small class="text-muted d-block">Advertisement</small>
                 <div id="age-top-ad"></div> 
            </div>

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

            <div id="ageMidAd" class="mt-4 text-center d-none ad-slot">
                 <small class="text-muted d-block">Advertisement</small>
                 <div id="age-result-ad"></div>
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
                    <div class="col-4"><div class="p-2 border rounded bg-white small"><b>Total Months:</b> <br><span id="totalMonths">--</span></div></div>
                    <div class="col-4"><div class="p-2 border rounded bg-white small"><b>Total Weeks:</b> <br><span id="totalWeeks">--</span></div></div>
                    <div class="col-4"><div class="p-2 border rounded bg-white small"><b>Total Days:</b> <br><span id="totalDays">--</span></div></div>
                </div>
            </div>`;
            
  }
}

// --- Smart Resizer Logic ---

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
  await openAd(); // 3 second wait karega
  window.print();
}

// QR Code
async function generateQR() {
  const text = document.getElementById("qrText").value;
  if (!text.trim()) return showNotify("error", "Enter text/URL for QR!");
  await openAd();
  document.getElementById("qrResult").innerHTML = `
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(text)}" class="img-fluid shadow rounded">
        <p class="text-muted mt-2">Right-click to save image</p>`;
  showNotify("success", "QR Code Generated!");
}

// AI Voice
function speakText() {
  const text = document.getElementById("speechText").value;
  if (!text.trim())
    return showNotify("error", "Type something for AI to speak!");
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
  showNotify("success", "AI is speaking...");
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
function resetVoice() {
  document.getElementById("speechText").value = "";
  window.speechSynthesis.cancel();
  showNotify("info", "Voice Stopped");
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
  history.pushState({ page: "extra" }, "");
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

    // Yahan Form submission ka logic (AJAX) wapas paste karein jo aapne upar diya tha.

    const form = document.getElementById("contact-form");
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = document.getElementById("form-submit");

      // VALIDATION: Agar aapne abhi tak ID change nahi ki hai, tabhi warning dega
      // Agar aapne real ID daal di hai toh ye 'if' skip ho jayega
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

// 3. Back Button Handler
window.onpopstate = function (event) {
  // Check if tools grid is hidden (means some tool is open)
  const grid = document.getElementById("toolsGrid");
  if (grid && grid.classList.contains("d-none")) {
    goBack();
  }
};

// Jab bhi naya tool khule, ad ko refresh karne ke liye
function refreshNativeAd() {
  if (localStorage.getItem("isSwiftVIP") === "true") return;
  const containerId = "container-1f80efc60776ec6b8e8266dae4f5fc1f";
  const container = document.getElementById(containerId);

  if (container) {
    // 1. Purani script dhoondo aur delete karo
    const oldScript = document.querySelector(
      `script[data-cfasync="false"][src*="invoke.js"]`,
    );
    if (oldScript) oldScript.remove();

    // 2. Container ko khali karo taaki naya ad load ho sake
    container.innerHTML = "";

    // 3. Nayi script create karo
    const newScript = document.createElement("script");
    newScript.async = true;
    newScript.dataset.cfasync = "false";
    // Timestamp add karne se browser cache bypass hota hai
    newScript.src = `//www.highperformanceformat.com/b35ebb7fb08b0d4cfa955a277c2007ce/invoke.js?t=${Date.now()}`;

    // 4. Script ko container ke baad ya body mein append karein
    document.body.appendChild(newScript);
  }
}

async function downloadAllAsZip() {
  if (extractedImages.length === 0) return;

  const zip = new JSZip();
  const btn = document.getElementById("downloadAllBtn");

  btn.disabled = true;
  btn.innerHTML = "Creating ZIP...";

  extractedImages.forEach((img) => {
    // base64 data se header hatana padta hai ZIP mein dalne ke liye
    const imgData = img.data.split(",")[1];
    zip.file(img.name, imgData, { base64: true });
  });

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);

  const a = document.createElement("a");
  a.href = url;
  a.download = "SwiftTool_Images.zip";
  a.click();

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-file-archive me-2"></i>Download All as ZIP';
  showNotify("success", "ZIP Downloaded!");
}

async function calculateAge() {
  const dobValue = document.getElementById("dob").value;
  const targetValue = document.getElementById("todayDate").value;

  if (!dobValue)
    return showNotify("error", "Please select your Date of Birth!");

  const dob = new Date(dobValue);
  const today = new Date(targetValue);

  if (dob > today) return showNotify("error", "DOB cannot be in the future!");

  await openAd();

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

  document.getElementById("ageResult").classList.remove("d-none");
  document.getElementById("ageMidAd")?.classList.remove("d-none");
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

  refreshNativeAd();
  showNotify("success", "Age Calculated Successfully!");
}
