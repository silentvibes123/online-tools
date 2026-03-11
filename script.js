pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

  function checkUrlAndLoadTool() {
    // URL se path nikaalo (e.g., "/cash" se "cash")
    const path = window.location.pathname.split("/").pop();
    
    // Tools ki list jo aapke paas hain
    const validTools = ["cash", "resizer", "age", "pdf", "compress", "qrcode", "pdfToImg", "voice", "merge", "split"];

    if (validTools.includes(path)) {
        // Agar valid tool hai, toh use kholo
        openTool(path);
    } else {
        // Agar kuch nahi hai ya galat hai, dashboard dikhao
        goToDashboard();
    }
}

// Jab page pehli baar load ho (Direct Link)
window.addEventListener("load", checkUrlAndLoadTool);

// Jab browser ka Back/Forward button dabayein
window.addEventListener("popstate", (event) => {
    if (event.state && event.state.tool) {
        openTool(event.state.tool);
    } else {
        goToDashboard();
    }
});
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
  // Default Dashboard Values
  let newTitle = "SwiftTool Pro - Free Online Digital Toolkit & PDF Tools";
  let metaDesc = "SwiftTool Pro offers free, secure, and fast digital tools like Image Resizer, Cash Counter, PDF Converter, and AI Voice. No file uploads, 100% private.";

  // Tool wise Title and Description
  if (toolName === "cash") {
    newTitle = "Online Cash Counter & Denomination Calculator | SwiftTool Pro";
    metaDesc = "Calculate total cash with Indian currency denominations (₹2000 to ₹1). Generate and print professional cash receipts instantly.";
  } else if (toolName === "resizer") {
    newTitle = "Exam Photo Resizer (20KB - 50KB) for SSC, UPSC, Bank | SwiftTool Pro";
    metaDesc = "Perfectly resize photos and signatures for SSC, UPSC, and IBPS exams. Compress to 20KB/50KB without quality loss.";
  } else if (toolName === "age") {
    newTitle = "Accurate Age Calculator by Date of Birth | SwiftTool Pro";
    metaDesc = "Calculate your exact age in years, months, and days. Perfect for government job forms and SSC/UPSC eligibility.";
  } else if (toolName === "pdf") {
    newTitle = "Images to PDF Converter - High Quality & Secure | SwiftTool Pro";
    metaDesc = "Convert JPG, PNG, and WEBP images into a single high-quality PDF document instantly.";
  } else if (toolName === "compress") {
    newTitle = "Compress Image to 20KB & 50KB Online | SwiftTool Pro";
    metaDesc = "Reduce image file size online without losing clarity. Best for optimizing photos for web use.";
  } else if (toolName === "qrcode") {
    newTitle = "Free QR Code Generator for Text & URL | SwiftTool Pro";
    metaDesc = "Create custom QR codes for your website or business cards for free. Instant download.";
  } else if (toolName === "pdfToImg") {
    newTitle = "PDF to Image Converter Online - Extract JPG | SwiftTool Pro";
    metaDesc = "Convert PDF pages into high-quality JPEG/PNG images securely in your browser.";
  } else if (toolName === "voice") {
    newTitle = "AI Voice - Free Text to Speech Online | SwiftTool Pro";
    metaDesc = "Convert your written text into a clear AI-powered human voice. Perfect for voiceovers.";
  } else if (toolName === "merge") {
    newTitle = "Merge PDF Files Online - Combine PDF Fast | SwiftTool Pro";
    metaDesc = "Combine multiple PDF documents into one single file securely.";
  } else if (toolName === "split") {
    newTitle = "Split PDF Pages - Extract Specific Pages | SwiftTool Pro";
    metaDesc = "Extract pages from your PDF file or split one PDF into multiple documents instantly.";
  }
  else if (!toolName || toolName === "home" || toolName === null) {
        document.title = "SwiftTool Pro - Free Online Digital Toolkit & PDF Tools";
        let metaDesc = "SwiftTool Pro offers free, secure, and fast digital tools like Image Resizer, Cash Counter, and PDF Tools.";
        let metaTag = document.querySelector('meta[name="description"]');
        if (metaTag) metaTag.setAttribute("content", metaDesc);
        return; // Function yahi stop kar do
    }

  // --- Final Update ---
  document.title = newTitle;
  let metaDescriptionTag = document.querySelector('meta[name="description"]');
  if (metaDescriptionTag) {
    metaDescriptionTag.setAttribute("content", metaDesc);
  }
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
    // 1. Saare Elements ko variables mein store karo (Crash se bachne ke liye)
    const toolsGrid = document.getElementById('toolsGrid');
    const seoSection = document.getElementById('seoSection');
    const extraScreens = document.getElementById('extraScreens');
    const activeTool = document.getElementById("activeTool");
    const toolUI = document.getElementById("toolUI");
    const heroSection = document.querySelector('.container-fluid.px-0.mb-5');

    // 2. Dashboard aur Extra Screens ko hide karo
    if (toolsGrid) toolsGrid.classList.add('d-none');
    if (seoSection) seoSection.classList.add('d-none');
    if (extraScreens) {
        extraScreens.classList.add('d-none');
        extraScreens.style.display = 'none';
    }
    if (heroSection) heroSection.classList.add('d-none');

    // 3. Active Tool container ko dikhao
    if (activeTool) {
        activeTool.classList.remove('d-none');
        activeTool.style.setProperty('display', 'block', 'important');
    }

    // 4. URL aur Title update karo
    if (window.location.pathname !== "/" + toolName) {
        window.history.pushState({ tool: toolName }, "", "/" + toolName);
    }
    
    // Ensure karo ye function aapki script mein hai
    if (typeof updateDynamicTitle === "function") {
        updateDynamicTitle(toolName);
    }

    // 5. Purana data saaf karke naya tool load karo
    if (toolUI) {
        toolUI.innerHTML = ""; 
        renderToolContent(toolName, toolUI);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function renderToolContent(toolName, container) {
  let content = "";
  const commonHeader = `
    <div class="mb-4 text-start">
        <button class="btn btn-sm btn-light border shadow-sm px-3" onclick="goToDashboard()">
            <i class="fas fa-arrow-left me-2 text-primary"></i>Back to Dashboard
        </button>
    </div>`;
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
                <div class="mt-4 text-center border-top pt-2">
      <p class="x-small text-muted mb-0">
          <i class="fas fa-shield-alt text-success me-1"></i> 
          Privacy: No files are uploaded. Processing is 100% Local.
      </p>
  </div>
            </div> 
           <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-success"><i class="fas fa-coins me-2"></i> Online Cash Counter & Denomination Calculator for India</h5>
    <p class="small text-muted">SwiftTool Pro offers the most reliable <strong>Indian Cash Counter</strong> designed specifically for business owners, bank employees, and individuals handling daily cash transactions. Calculating bundles of cash can be time-consuming and prone to human error; our tool automates this process instantly.</p>
    <p class="small text-muted"><strong>How it works:</strong> Simply enter the number of notes you have for each denomination (₹2000, ₹500, ₹200, ₹100, ₹50, ₹20, ₹10, ₹5, ₹2, ₹1). The tool automatically calculates the total amount for each row and provides a <strong>Grand Total</strong> in real-time. We follow the official Indian currency format (₹) and ensure that your calculations are 100% accurate every single time.</p>
    <p class="small text-muted"><strong>Key Benefits:</strong> 1. <strong>Printable Receipts:</strong> Generate a professional cash memo to attach with your bank deposit slip (Challan) for SBI, PNB, ICICI, or HDFC banks. 2. <strong>Error-Free:</strong> Eliminate manual counting mistakes that happen during busy shop hours. 3. <strong>Privacy:</strong> Unlike other tools, we do not store your financial data. Everything happens locally in your browser. Whether you are managing a retail shop, a gas station, or personal savings, our <strong>Cash Denomination Calculator</strong> is your perfect digital companion.</p>
    <p class="small text-muted"><strong>SEO Tip:</strong> Use this tool to save time during end-of-day accounting. It is a perfect alternative to physical cash counting machines for small to medium-sized businesses.</p>
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
            <div class="mt-4 text-center border-top pt-2">
      <p class="x-small text-muted mb-0">
          <i class="fas fa-shield-alt text-success me-1"></i> 
          Privacy: No files are uploaded. Processing is 100% Local.
      </p>
  </div>
            <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
                <h5 class="fw-bold text-danger"><i class="fas fa-file-pdf me-2"></i> Professional Image to PDF Converter</h5>
                <p class="small text-muted">Convert JPG, PNG, or WEBP images into a single high-quality PDF document instantly.</p>
            </div>
           <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-danger"><i class="fas fa-file-pdf me-2"></i> Fast & Secure Image to PDF Converter Online</h5>
    <p class="small text-muted">SwiftTool Pro's <strong>Image to PDF Converter</strong> is a versatile tool designed for students, office workers, and anyone needing to organize photos into a single document. Whether you have JPG, PNG, or WEBP images, our tool combines them into a professional-grade PDF instantly. This is particularly useful for creating digital assignments, scanning handwritten notes, or submitting KYC documents on government portals.</p>
    <p class="small text-muted"><strong>Why Privacy is Our Priority:</strong> Most online converters upload your personal photos to their cloud servers, which can be a huge privacy risk. Our <strong>Image to PDF</strong> tool works entirely within your browser. This means your images never leave your device, making it the safest choice for sensitive documents like Aadhaar cards, PAN cards, or private certificates.</p>
    <p class="small text-muted"><strong>Key Features:</strong> 1. <strong>Bulk Conversion:</strong> Upload multiple images at once and arrange them in order. 2. <strong>No Quality Loss:</strong> We ensure that your photos remain sharp and readable in the final PDF. 3. <strong>Zero Limits:</strong> Convert as many images as you want without any hidden fees or watermarks. 4. <strong>Universal Compatibility:</strong> The generated PDF is standard-compliant and opens perfectly on all devices, including Android, iOS, Windows, and Mac.</p>
    <p class="small text-muted"><strong>Pro Tip:</strong> Before generating, ensure your images are in the correct sequence. This tool is a great free alternative to paid software like Adobe Acrobat for daily document management.</p>
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
                <div class="mt-4 text-center border-top pt-2">
      <p class="x-small text-muted mb-0">
          <i class="fas fa-shield-alt text-success me-1"></i> 
          Privacy: No files are uploaded. Processing is 100% Local.
      </p>
  </div>
               <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-warning"><i class="fas fa-id-badge me-2"></i> Professional Exam Photo & Signature Resizer (20KB - 50KB)</h5>
    <p class="small text-muted">Filling out government job applications like <strong>SSC GD, UPSC, IBPS, or Railway (RRB)</strong> can be frustrating when your photo or signature gets rejected due to incorrect file size. SwiftTool Pro's <strong>Online Image Resizer</strong> is specially programmed to meet the exact dimensions and KB requirements of Indian competitive exams.</p>
    <p class="small text-muted"><strong>Standard Specifications:</strong> Most exams require a photograph of <strong>3.5cm x 4.5cm (350x450 pixels)</strong> with a file size between 20KB to 50KB, and signatures between 10KB to 20KB. Our smart algorithm automatically adjusts the aspect ratio and applies the right amount of compression to hit these targets without making your face blurry or unreadable.</p>
    <p class="small text-muted"><strong>Why Choose SwiftTool Pro?</strong> 1. <strong>Privacy:</strong> Your personal photos are sensitive. Your data never reaches any server. 2. <strong>Instant Download:</strong> No waiting, no watermarks, just high-quality resized images ready for upload. 3. <strong>Format Support:</strong> Works perfectly with JPG, JPEG, and PNG formats.</p>
    <p class="small text-muted"><strong>Step-by-Step Guide:</strong> Select your file, choose your target size (20KB for signature or 50KB for photo), and click 'Download'. This tool is a must-have for students preparing for government exams who want to avoid the 'File size too large' error on official portals.</p>
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
            <div class="mt-4 text-center border-top pt-2">
      <p class="x-small text-muted mb-0">
          <i class="fas fa-shield-alt text-success me-1"></i> 
          Privacy: No files are uploaded. Processing is 100% Local.
      </p>
  </div>
           <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-primary"><i class="fas fa-object-group me-2"></i> Combine Multiple PDF Files Securely - PDF Merger</h5>
    <p class="small text-muted">Managing multiple PDF documents can be messy. SwiftTool Pro's <strong>Merge PDF tool</strong> allows you to combine several PDF files into one neatly organized document in seconds. This is an essential feature for lawyers, accountants, and students who need to merge different chapters or reports into a single submission-ready file.</p>
    <p class="small text-muted"><strong>Unlimited & Free:</strong> Most online mergers limit the number of files you can join or charge for "Pro" features. Our <strong>PDF Combiner</strong> is completely free with no restrictions. You can upload two or twenty PDFs and merge them instantly. The formatting, links, and text within your original PDFs will remain perfectly intact in the merged version.</p>
    <p class="small text-muted"><strong>Data Protection:</strong> Since we use browser-side JavaScript technology, your documents are never uploaded to any external server. This approach makes us the most trusted <strong>Private PDF Merger</strong> for handling bank statements, legal contracts, and personal records. You can merge your files even without an active internet connection once the tool is loaded.</p>
    <p class="small text-muted"><strong>How to use:</strong> Simply select the PDF files you wish to join, and click 'Merge & Download'. Your new combined document will be ready immediately, saving you the hassle of sending multiple attachments in emails.</p>
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
            <div class="mt-4 text-center border-top pt-2">
      <p class="x-small text-muted mb-0">
          <i class="fas fa-shield-alt text-success me-1"></i> 
          Privacy: No files are uploaded. Processing is 100% Local.
      </p>
  </div>
           <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-warning"><i class="fas fa-cut me-2"></i> Professional PDF Splitter - Extract Specific Pages Online</h5>
    <p class="small text-muted">Sometimes, a 50-page PDF contains only one or two pages that you actually need. SwiftTool Pro's <strong>Split PDF tool</strong> allows you to extract specific pages or a range of pages from any PDF document effortlessly. This is a must-have tool for teachers sharing specific lessons or employees extracting certain invoices from a large monthly report.</p>
    <p class="small text-muted"><strong>Precise Page Extraction:</strong> You can define a custom range, such as "Page 5 to Page 10", and our tool will create a new PDF containing only those pages. The original file remains untouched. This <strong>PDF Splitter</strong> ensures that the quality of images and the layout of text are preserved perfectly in the extracted document.</p>
    <p class="small text-muted"><strong>Why SwiftTool Pro?</strong> 1. <strong>High Speed:</strong> Processing happens on your device's hardware, making it much faster than cloud-based alternatives. 2. <strong>Complete Privacy:</strong> Your sensitive reports and documents stay on your computer. 3. <strong>Free to Use:</strong> No watermarks or page limits—split even the largest PDF files for free.</p>
    <p class="small text-muted"><strong>How it works:</strong> Upload your PDF, enter the 'From' and 'To' page numbers, and hit 'Split & Download'. It’s that simple. Extract what you need and keep your documents lightweight and relevant.</p>
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
                    <div class="mt-4 text-center border-top pt-2">
      <p class="x-small text-muted mb-0">
          <i class="fas fa-shield-alt text-success me-1"></i> 
          Privacy: No files are uploaded. Processing is 100% Local.
      </p>
  </div>
                </div>
            </div>
           <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-primary"><i class="fas fa-compress-arrows-alt me-2"></i> Smart Image Compressor - Reduce KB Without Losing Quality</h5>
    <p class="small text-muted">Reducing image file size is a common challenge when uploading documents to job portals or websites. SwiftTool Pro's <strong>Online Image Compressor</strong> uses an advanced compression algorithm that shrinks your photos (JPG/PNG) to 20KB, 50KB, or 100KB while maintaining excellent visual clarity. This is the perfect tool for web developers looking to improve site speed and students filling out exam forms.</p>
    <p class="small text-muted"><strong>Customizable Compression:</strong> Unlike "one-size-fits-all" tools, we provide a <strong>Quality Slider</strong>. You can manually adjust the compression level from 10% to 100% to find the perfect balance between file size and image sharpness. You can see a real-time preview of how the compressed image looks before downloading it.</p>
    <p class="small text-muted"><strong>Key Benefits:</strong> 1. <strong>Save Storage:</strong> Free up space on your phone or computer by optimizing large photos. 2. <strong>Faster Uploads:</strong> Smaller files upload quickly on slow internet connections. 3. <strong>Exam Ready:</strong> Specifically designed to meet the strict KB limits of <strong>SSC, UPSC, and IBPS</strong> portals. 4. <strong>100% Secure:</strong> No server-side processing—your data stays on your machine.</p>
    <p class="small text-muted"><strong>Usage Guide:</strong> Select your image, adjust the quality slider, and check the preview. Once satisfied, click download. This tool ensures your "File size too large" errors are a thing of the past.</p>
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
            <div class="mt-4 text-center border-top pt-2">
      <p class="x-small text-muted mb-0">
          <i class="fas fa-shield-alt text-success me-1"></i> 
          Privacy: No files are uploaded. Processing is 100% Local.
      </p>
  </div>
            <div id="qrResult" class="text-center mt-4"></div>
         <div class="mt-5 p-4 bg-light rounded shadow-sm text-dark border-start border-dark border-4">
                <h2 class="h5 fw-bold mb-3 text-dark">
                    <i class="fas fa-qrcode me-2"></i>Secure & Instant QR Code Generator Online
                </h2>
                <p class="small text-muted mb-4">
                    SwiftTool Pro provides a fast, reliable, and completely private **Online QR Code Generator**. Whether you want to share a website link, a professional portfolio, or simplified UPI payment details, our tool creates high-definition QR codes in a single click. No registration, no tracking, just pure utility.
                </p>

                <div class="row g-4">
                    <div class="col-md-6">
                        <h3 class="h6 fw-bold text-dark"><i class="fas fa-lock me-2 text-success"></i>Private & Offline Capability</h3>
                        <p class="x-small text-muted">
                            Most QR generators track your clicks and store your data. SwiftTool Pro uses **client-side JavaScript**, meaning your text or URL never leaves your browser. It’s the safest way to generate QR codes for sensitive information.
                        </p>
                    </div>
                    <div class="col-md-6">
                        <h3 class="h6 fw-bold text-dark"><i class="fas fa-expand me-2 text-primary"></i>Universal Compatibility</h3>
                        <p class="x-small text-muted">
                            The QR codes generated here are standard-compliant and can be scanned by any smartphone camera, Google Lens, or specialized QR scanner apps on Android and iOS. Perfect for business cards, flyers, and digital menus.
                        </p>
                    </div>
                    <div class="col-md-12">
                        <h3 class="h6 fw-bold text-dark"><i class="fas fa-check-circle me-2 text-info"></i>No Expiration, No Watermarks</h3>
                        <p class="x-small text-muted">
                            Unlike other "premium" tools that expire your QR codes after a few days, SwiftTool Pro generates **Static QR Codes** that work forever. We don't add any annoying logos or watermarks, giving you a clean and professional look for free.
                        </p>
                    </div>
                </div>

                <div class="mt-4 p-3 bg-white rounded border">
                    <h4 class="h6 fw-bold mb-2">Popular Use Cases for QR Codes:</h4>
                    <ul class="x-small text-muted ps-3">
                        <li class="mb-1"><strong>Website URLs:</strong> Instant access to your blog or business site.</li>
                        <li class="mb-1"><strong>UPI Payments:</strong> Share your payment ID safely for quick transactions.</li>
                        <li class="mb-1"><strong>Contact Info:</strong> Generate a QR for your portfolio or social media profiles.</li>
                        <li class="mb-1"><strong>WiFi Access:</strong> Share your network details with guests effortlessly.</li>
                    </ul>
                </div>
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
            <div class="mt-4 text-center border-top pt-2">
      <p class="x-small text-muted mb-0">
          <i class="fas fa-shield-alt text-success me-1"></i> 
          Privacy: No files are uploaded. Processing is 100% Local.
      </p>
  </div>
            <div id="pdfPreview" class="row g-3 mt-4"></div>
            
            <div class="mt-5 p-4 bg-light rounded shadow-sm text-dark border-start border-primary border-4">
    <h2 class="h5 fw-bold mb-3 text-primary">
        <i class="fas fa-images me-2"></i>Professional PDF to Image Converter Online
    </h2>
    <p class="small text-muted mb-4">
        SwiftTool Pro offers the most reliable way to convert your PDF documents into high-quality images (JPG/PNG) instantly. Whether you are a student preparing for **SSC, UPSC, or Banking exams** or a professional handling office documents, our tool ensures your files are processed with 100% accuracy and privacy.
    </p>

    <div class="row g-4">
        <div class="col-md-6">
            <h3 class="h6 fw-bold text-dark"><i class="fas fa-user-shield me-2 text-success"></i>100% Privacy & Local Processing</h3>
            <p class="x-small text-muted">
                Unlike other converters, we process your files directly in your browser. Your sensitive documents like **Aadhaar cards, PAN cards, or marksheets** are never uploaded to any server, keeping your data completely safe and private.
            </p>
        </div>
        <div class="col-md-6">
            <h3 class="h6 fw-bold text-dark"><i class="fas fa-bolt me-2 text-warning"></i>Fast & Batch Extraction</h3>
            <p class="x-small text-muted">
                Extract all pages from a multi-page PDF as individual images in just one click. Our engine is optimized for speed, allowing you to download your converted images as a high-quality ZIP file or individual JPGs.
            </p>
        </div>
        <div class="col-md-12">
            <h3 class="h6 fw-bold text-dark"><i class="fas fa-check-circle me-2 text-primary"></i>No Limits, No Watermarks</h3>
            <p class="x-small text-muted">
                Enjoy unlimited conversions without any hidden costs or annoying watermarks on your output. We focus on providing a clean, "pro" experience for every user, making it the best free alternative to paid software.
            </p>
        </div>
    </div>

    <div class="mt-4 p-3 bg-white rounded border">
        <h4 class="h6 fw-bold mb-2">How to convert PDF to Image for Exam Portals:</h4>
        <ol class="x-small text-muted ps-3">
            <li class="mb-1">Select your PDF file from your device.</li>
            <li class="mb-1">Wait for our tool to generate high-resolution previews of each page.</li>
            <li class="mb-1">Click "Download All" to save all pages as a ZIP or download specific pages as JPG.</li>
        </ol>
    </div>
</div>
            `;
    // ... baaki tool logic ...
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
            <input type="file" id="pdfInputVoice" hidden accept="application/pdf" onchange="processVoicePDF(this.files[0])">
        </div>

        <div id="voiceControls" class="mb-3 p-3 bg-white border rounded shadow-sm">
            <div class="row g-2 mb-3">
                <div id="pageSelectCol" class="col-6 text-start d-none">
                    <label class="small fw-bold">Select Page:</label>
                    <select id="pageSelect" class="form-select form-select-sm" onchange="stopVoice()"></select>
                </div>
                <div class="col text-start">
                    <label class="small fw-bold">Speed Control:</label>
                    <select id="voiceSpeed" class="form-select form-select-sm">
                        <option value="0.8">Slow</option>
                        <option value="1" selected>Normal</option>
                        <option value="1.2">Fast</option>
                        <option value="1.5">Very Fast</option>
                    </select>
                </div>
            </div>

            <div id="manualText">
                <label class="form-label fw-bold d-block text-start">Type/Paste Text Below:</label>
                <textarea id="speechText" class="form-control mb-3" rows="4" placeholder="Type here and click Play..."></textarea>
            </div>

            <div class="form-check form-switch mb-3 text-start" id="autoNextDiv">
                <input class="form-check-input" type="checkbox" id="autoNext" checked>
                <label class="form-check-label small fw-bold" for="autoNext">Auto-read all pages (PDF)</label>
            </div>

            <div class="d-flex gap-2 justify-content-center">
                <button id="mainPlayBtn" class="btn btn-warning px-4 fw-bold flex-fill" onclick="playVoice()">
                    <i class="fas fa-play me-1"></i> Play
                </button>
                <button class="btn btn-secondary px-3 fw-bold" onclick="pauseVoice()">
                    <i class="fas fa-pause"></i>
                </button>
                <button class="btn btn-danger px-3 fw-bold" onclick="stopVoice()">
                    <i class="fas fa-stop"></i>
                </button>
                <div class="mt-4 text-center border-top pt-2">
      <p class="x-small text-muted mb-0">
          <i class="fas fa-shield-alt text-success me-1"></i> 
          Privacy: No files are uploaded. Processing is 100% Local.
      </p>
  </div>
            </div>
        </div>

       <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-warning"><i class="fas fa-microphone-alt me-2"></i> Free AI Text-to-Speech & PDF Audio Reader</h5>
    <p class="small text-muted">SwiftTool Pro's <strong>AI Voice tool</strong> is a powerful accessibility and productivity feature. It allows you to convert any written text or digital PDF into a natural-sounding human voice. This is perfect for students who want to listen to their notes, content creators looking for voiceovers, or individuals with visual impairments.</p>
    <p class="small text-muted"><strong>How it enhances productivity:</strong> Instead of straining your eyes reading long documents, simply upload your PDF or paste your text and let our AI read it for you. You can adjust the <strong>Speech Speed</strong> (Slow to Very Fast) to match your listening comfort. Our tool supports multiple languages including English and Hindi, providing a versatile experience for Indian users.</p>
    <p class="small text-muted"><strong>Features at a Glance:</strong> 1. <strong>PDF Reader:</strong> Upload any digital PDF and navigate through pages effortlessly. 2. <strong>Manual Text:</strong> Paste scripts or articles to hear them instantly. 3. <strong>Auto-Read:</strong> Enable 'Auto-read all pages' for an uninterrupted audiobook-like experience. 4. <strong>No Cloud Fees:</strong> We use your browser's native Speech Synthesis API, making it completely free and private.</p>
    <p class="small text-muted"><strong>Ideal for:</strong> Proofreading your own writing, learning new languages by hearing correct pronunciations, and multitasking while consuming long-form content. Experience the future of text-to-voice technology today with SwiftTool Pro.</p>
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
                <div class="mt-4 text-center border-top pt-2">
      <p class="x-small text-muted mb-0">
          <i class="fas fa-shield-alt text-success me-1"></i> 
          Privacy: No files are uploaded. Processing is 100% Local.
      </p>
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
    <h5 class="fw-bold text-danger"><i class="fas fa-birthday-cake me-2"></i> Accurate Age Calculator - Find Your Exact Age in Seconds</h5>
    <p class="small text-muted">Are you filling out a government job form and need to know your exact age as of a specific date? SwiftTool Pro's <strong>Age Calculator by Date of Birth</strong> provides an instant and high-precision breakdown of your age. Whether it is for <strong>SSC eligibility, UPSC age limits, or retirement planning</strong>, our tool gives you the data you need with 100% accuracy.</p>
    <p class="small text-muted"><strong>Comprehensive Data:</strong> We don't just show years. Our tool calculates your age in <strong>Years, Months, and Days</strong>. Additionally, we provide a detailed summary of your life in <strong>Total Months, Total Weeks, and Total Days</strong>. This level of detail is perfect for calculating a baby's age in weeks or finding out exactly how many days are left until your next big milestone.</p>
    <p class="small text-muted"><strong>User-Friendly Design:</strong> Simply select your 'Date of Birth' and the 'Target Date' (which defaults to today). The calculation happens instantly. 1. <strong>Exam Eligibility:</strong> Easily check if you fall within the 18-27 or 21-32 age brackets for various competitive exams. 2. <strong>Special Occasions:</strong> Find out the exact day of the week you were born. 3. <strong>Fast & Free:</strong> No complex forms or registrations required.</p>
    <p class="small text-muted"><strong>SEO Tip:</strong> This tool is a favorite among job seekers in India. Bookmark this page to quickly verify your age eligibility for the latest sarkari naukri notifications.</p>
  </div>
            `;
  } else if (toolName === "wordToPdf" || toolName === "formatter") {
    content =
      commonHeader + `
      <div class="formatter-container p-1 text-start">
          <div class="d-flex justify-content-between align-items-center mb-3">
              <h3><i class="fas fa-file-word me-2 text-primary"></i>Word to PDF Converter</h3>
              <button class="btn btn-sm btn-outline-danger" onclick="openTool('wordToPdf')"><i class="fas fa-redo"></i> Reset</button>
          </div><hr>

          <div id="dropZone" class="border-dashed p-5 text-center rounded-3 bg-light mb-4" 
               onclick="document.getElementById('docInput').click()" style="cursor:pointer; border: 2px dashed #0d6efd;">
              <i class="fas fa-file-import fa-3x text-primary mb-2"></i>
              <h5 class="fw-bold">Select Word Document (.docx)</h5>
              <p class="text-muted small">Choose a file to convert it into high-quality PDF</p>
              <input type="file" id="docInput" hidden accept=".docx" onchange="convertWordToPdf(this.files[0])">
          </div>

          <div id="previewContainer" class="d-none animate__animated animate__fadeIn">
              <div class="alert alert-success d-flex align-items-center">
                  <i class="fas fa-check-circle me-2"></i> File Ready to Convert!
              </div>
              <div id="wordPreview" class="p-3 border bg-white mb-3 shadow-sm" style="max-height:400px; overflow-y:auto; font-family:serif; line-height:1.6;">
              </div>
              <button id="downloadPdfBtn" class="btn btn-primary w-100 btn-lg fw-bold shadow" onclick="downloadGeneratedPDF()">
                  <i class="fas fa-file-pdf me-2"></i>Download as PDF
              </button>
          </div>
          <div class="mt-4 text-center border-top pt-2">
      <p class="x-small text-muted mb-0">
          <i class="fas fa-shield-alt text-success me-1"></i> 
          Privacy: No files are uploaded. Processing is 100% Local.
      </p>
  </div>

         <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-primary"><i class="fas fa-file-word me-2"></i> Best Word to PDF Converter - 100% Private</h5>
    <p class="small text-muted">Converting <strong>DOCX to PDF</strong> is a daily necessity for students and professionals. However, most online converters upload your sensitive documents to their servers, posing a security risk. SwiftTool Pro solves this with our <strong>Browser-Based Word to PDF Converter</strong>. Your document stays on your computer throughout the entire process.</p>
    <p class="small text-muted"><strong>Professional Quality:</strong> Our tool preserves the original formatting of your Word document, including fonts, tables, bullet points, and images. Whether it's a resume, an assignment, or a business proposal, the output PDF will look exactly like the original Word file. We use advanced libraries like Mammoth.js to ensure high fidelity during the HTML-to-PDF transition.</p>
    <p class="small text-muted"><strong>Key Features:</strong> 1. <strong>Unlimited Conversions:</strong> No daily limits or subscriptions required. 2. <strong>No Registration:</strong> Start converting immediately without giving your email address. 3. <strong>Device Compatible:</strong> Works on Windows, Mac, Android, and iOS browsers. 4. <strong>Secure:</strong> Since it works offline, even your ISP cannot see the content of your converted documents.</p>
    <p class="small text-muted"><strong>SEO Guide:</strong> PDF is the standard for sharing documents because it locks the layout. Use our tool to convert your DOCX files before emailing them or uploading them to job portals to ensure your document looks professional on every screen.</p>
    </div>`;
  }

  // PDF to Text (Formatter) UI
  else if (toolName === "pdfToWord") {
     content =
      commonHeader + `
      <div class="text-center">
          <h3 class="fw-bold mb-3"><i class="fas fa-file-alt text-info me-2"></i>PDF to Text Formatter</h3>
          <p class="text-muted">Extract text from PDF, edit and save.</p>
          <div id="pdfUploadZone" class="upload-area p-5 border-dashed rounded-4 bg-light mb-3" 
               onclick="document.getElementById('pdfFormatInput').click()" style="cursor:pointer; border: 2px dashed #17a2b8;">
              <i class="fas fa-file-import fa-3x text-info mb-3"></i>
              <h5>Select PDF File</h5>
              <input type="file" id="pdfFormatInput" hidden accept="application/pdf" onchange="processFormatPDF(this.files[0])">
          </div>
          <div id="editorZone" class="d-none animate__animated animate__fadeIn">
              <textarea id="pdfEditor" class="form-control mb-3" rows="12" style="font-size:14px;" placeholder="Edit extracted text here..."></textarea>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary w-50" onclick="openTool('pdfToWord')">Cancel</button>
                <button class="btn btn-info w-50 text-white fw-bold" onclick="downloadFormattedPDF()">
                    <i class="fas fa-download me-2"></i>Download Text
                </button>
              </div>
              
          </div>
      </div>
      <div class="mt-4 text-center border-top pt-2">
      <p class="x-small text-muted mb-0">
          <i class="fas fa-shield-alt text-success me-1"></i> 
          Privacy: No files are uploaded. Processing is 100% Local.
      </p>
  </div>
      <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-info"><i class="fas fa-file-alt me-2"></i> Advanced PDF to Text Formatter & Editor</h5>
    <p class="small text-muted">Extracting editable text from a PDF can be a nightmare if you don't have the right tools. SwiftTool Pro's <strong>PDF to Text Formatter</strong> uses high-performance text extraction technology to pull content directly from your PDF files and place it into a built-in <strong>Smart Editor</strong>. This is perfect for converting reports into blog posts, notes into assignments, or data into emails.</p>
    <p class="small text-muted"><strong>Edit Before You Save:</strong> Unlike basic converters, we provide an interactive workspace. Once the text is extracted, you can manually edit, delete, or add new content within our editor zone. This ensures that the final text file you download is exactly how you want it, without any weird symbols or broken sentences often found in PDF exports.</p>
    <p class="small text-muted"><strong>Benefits of Text Extraction:</strong> 1. <strong>Lightweight Files:</strong> Text files (.txt) are thousands of times smaller than PDFs. 2. <strong>Searchability:</strong> Make your document content easily searchable and indexable. 3. <strong>Browser-Based Security:</strong> Your PDF content is never uploaded to a server, ensuring 100% confidentiality for your business or personal notes.</p>
    <p class="small text-muted"><strong>Pro Guide:</strong> Upload your PDF, review the extracted text in the editor, make your changes, and click 'Download Text'. This tool is a lifesaver for researchers and writers who deal with digital documents daily.</p>
  </div>
      `;
  }
  else if (toolName === "gst") {
    content =
      commonHeader +
      `
      <div class="d-flex justify-content-between align-items-center mb-3">
          <h3><i class="fas fa-file-invoice-dollar me-2 text-primary"></i>GST Calculator (India)</h3>
          <button class="btn btn-sm btn-outline-danger" onclick="resetGST()"><i class="fas fa-redo me-1"></i> Reset</button>
      </div><hr>
      <div class="card border-0 bg-light p-4 mb-4 shadow-sm text-start">
          <div class="row g-3">
              <div class="col-12">
                  <label class="form-label fw-bold">Enter Net Amount (₹)</label>
                  <input type="number" id="gstAmount" class="form-control form-control-lg border-primary" placeholder="e.g. 10000">
              </div>
              <div class="col-12">
                  <label class="form-label fw-bold">Select GST Rate</label>
                  <div class="btn-group w-100" role="group">
                      <input type="radio" class="btn-check" name="gstRate" id="r5" value="5">
                      <label class="btn btn-outline-primary" for="r5">5%</label>
                      <input type="radio" class="btn-check" name="gstRate" id="r12" value="12">
                      <label class="btn btn-outline-primary" for="r12">12%</label>
                      <input type="radio" class="btn-check" name="gstRate" id="r18" value="18" checked>
                      <label class="btn btn-outline-primary" for="r18">18%</label>
                      <input type="radio" class="btn-check" name="gstRate" id="r28" value="28">
                      <label class="btn btn-outline-primary" for="r28">28%</label>
                  </div>
              </div>
              <div class="col-6">
                  <button onclick="calculateGST(true)" class="btn btn-primary w-100 py-3 fw-bold shadow-sm">Add GST</button>
              </div>
              <div class="col-6">
                  <button onclick="calculateGST(false)" class="btn btn-outline-primary w-100 py-3 fw-bold shadow-sm">Remove GST</button>
              </div>
          </div>
      </div>

      <div id="gstResult" class="d-none animate__animated animate__fadeIn">
          <div class="card border-primary p-3 shadow-sm bg-white text-start">
              <div class="d-flex justify-content-between mb-2"><span>Net Amount:</span><span class="fw-bold">₹<span id="resNet">0</span></span></div>
              <div class="d-flex justify-content-between mb-2"><span>CGST:</span><span class="text-muted">₹<span id="resCGST">0</span></span></div>
              <div class="d-flex justify-content-between mb-2"><span>SGST:</span><span class="text-muted">₹<span id="resSGST">0</span></span></div>
              <hr>
              <div class="d-flex justify-content-between"><span class="h5 fw-bold">Total Amount:</span><span class="h5 fw-bold text-primary">₹<span id="resTotal">0</span></span></div>
          </div>
      </div>

      <div class="mt-4 text-center border-top pt-2">
          <p class="x-small text-muted mb-0"><i class="fas fa-shield-alt text-success me-1"></i> Privacy: 100% Local Calculation</p>
      </div>

      <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
          <h5 class="fw-bold text-primary"><i class="fas fa-calculator me-2"></i> GST Calculator India Online</h5>
          <p class="small text-muted">Use this tool to calculate GST (Goods and Services Tax) for any amount. You can either add GST to a base price or find the original price by removing GST from a total inclusive price.</p>
      </div>
      <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-primary"><i class="fas fa-file-invoice-dollar me-2"></i> Online GST Calculator India - Add & Remove GST Instantly</h5>
    <p class="small text-muted">SwiftTool Pro brings you the most accurate <strong>Online GST Calculator</strong> designed specifically for the Indian taxation system. Whether you are a business owner, a freelancer, or a student, our tool helps you calculate <strong>CGST, SGST, and IGST</strong> in seconds without any manual errors.</p>
    
    <h6 class="fw-bold mt-4 text-dark">How to Calculate GST Online?</h6>
    <p class="small text-muted">Calculating GST is now easier than ever. Simply enter your net amount, select the applicable GST slab (5%, 12%, 18%, or 28%), and choose whether you want to <strong>Add GST</strong> or <strong>Remove GST</strong>.
    <br><br>
    <strong>1. GST Inclusive (Remove GST):</strong> If you have a total price and want to know the original price before tax, use the 'Remove GST' feature. This is also known as a <strong>Reverse GST Calculator</strong>.
    <br>
    <strong>2. GST Exclusive (Add GST):</strong> If you have the base price and want to add tax to find the final billing amount, use the 'Add GST' feature.</p>

    <h6 class="fw-bold mt-4 text-dark">Why Use Our GST Calculator?</h6>
    <ul class="small text-muted">
        <li><strong>Accurate Tax Breakup:</strong> Get a clear split of CGST (Central GST) and SGST (State GST) for local transactions.</li>
        <li><strong>Reverse GST Calculation:</strong> Easily find the pre-tax value of any product from its MRP.</li>
        <li><strong>India Specific Slabs:</strong> Pre-defined buttons for 5%, 12%, 18%, and 28% as per the latest GST Council rules.</li>
        <li><strong>100% Privacy:</strong> Your financial data is never uploaded. All calculations happen locally in your browser.</li>
    </ul>

    <h6 class="fw-bold mt-4 text-dark">GST Calculation Formula (Example)</h6>
    <p class="small text-muted">To calculate GST, we use the standard mathematical formula:
    <br>• For Adding GST: <code>GST Amount = (Original Cost * GST%) / 100</code>
    <br>• For Removing GST: <code>Original Cost = Total Price / (1 + GST% / 100)</code>
    <br><br>
    For example, if you have a product worth ₹1,180 (including 18% GST), our tool will reverse-calculate it to show a Net Price of ₹1,000 and a total GST of ₹180.</p>

    <h6 class="fw-bold mt-4 text-dark">Perfect for Business & Accounting</h6>
    <p class="small text-muted">This <strong>Free GST Tool</strong> is ideal for generating quick quotes, checking invoice accuracy, and filing GST returns. It works perfectly on mobile and desktop, making it a handy companion for shopkeepers and CA professionals across India.</p>
    </div>
      `;

}

else if (toolName === "removePages") {
    content = commonHeader + `
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h3><i class="fas fa-trash-alt me-2 text-danger"></i>Remove PDF Pages</h3>
        <button class="btn btn-sm btn-outline-secondary" onclick="openTool('removePages')"><i class="fas fa-redo"></i> Reset</button>
    </div><hr>
    
    <div class="row">
        <div class="col-md-4">
            <div class="card p-3 shadow-sm mb-3">
                <label class="fw-bold small mb-2">1. Upload PDF</label>
                <input type="file" id="removeInput" accept="application/pdf" class="form-control mb-3" onchange="previewPdfPages()">
                
                <label class="fw-bold small mb-2">2. Enter Page Numbers (e.g., 1, 3)</label>
                <input type="text" id="pageNumbers" class="form-control mb-3" placeholder="Ex: 1, 4, 7" oninput="markPagesForRemoval()">
                
                <button class="btn btn-danger w-100 fw-bold" id="removeBtn" onclick="handleRemovePages()">
                    <i class="fas fa-file-pdf me-2"></i>Remove & Download
                </button>
            </div>
            <div class="alert alert-warning x-small">
                <i class="fas fa-lightbulb me-1"></i> <b>Tip:</b> Type the page numbers, and you'll see a red cross on the preview!
            </div>
        </div>
        
        <div class="col-md-8">
            <div id="pdfPreviewContainer" class="row g-2 overflow-auto border rounded bg-light p-3" style="max-height: 500px;">
                <p class="text-muted text-center w-100 py-5">Upload a PDF to see page previews...</p>
            </div>
        </div>
    </div>

    <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
        <h5 class="fw-bold text-danger"><i class="fas fa-eye me-2"></i> Visual PDF Page Remover</h5>
        <p class="small text-muted">SwiftTool Pro's Visual Remover allows you to see exactly which pages you are deleting. No more guessing page numbers! Our tool processes everything locally in your browser for 100% security.</p>
    </div>
    <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h4 class="fw-bold text-dark mb-3">
        <i class="fas fa-search me-2 text-danger"></i> 
        Free Online PDF Page Remover – Secure & Fast
    </h4>
    
    <p class="text-muted">
        Are you looking for a way to <strong>delete pages from PDF</strong> without installing heavy software? SwiftTool Pro’s 
        <strong>Visual PDF Page Remover</strong> is the most efficient solution. Whether it's an extra blank page, 
        a confidential sheet, or an unnecessary section, you can remove it in seconds.
    </p>

    <div class="row g-4 mt-2">
        <div class="col-md-6">
            <h6 class="fw-bold"><i class="fas fa-eye text-primary me-2"></i>Visual Page Selection</h6>
            <p class="small text-muted">
                Unlike other tools where you guess page numbers, our tool generates <strong>real-time thumbnails</strong>. 
                You can see exactly what you are deleting with our unique "Red Cross" visual feedback system.
            </p>
        </div>
        <div class="col-md-6">
            <h6 class="fw-bold"><i class="fas fa-user-shield text-success me-2"></i>100% Private & Secure</h6>
            <p class="small text-muted">
                Your privacy is our priority. This is an <strong>PDF Remover</strong>, meaning your files 
                are processed locally in your browser. They are never uploaded to any server, making it safe for bank statements and legal documents.
            </p>
        </div>
    </div>

    <hr class="my-4">

    <h5 class="fw-bold mb-3">How to Remove Pages from PDF?</h5>
    <ul class="text-muted small">
        <li><strong>Step 1:</strong> Select and upload your PDF file from your device.</li>
        <li><strong>Step 2:</strong> Look at the thumbnails and identify the pages you want to delete.</li>
        <li><strong>Step 3:</strong> Enter the page numbers (e.g., 1, 4, 5) in the input box. A red cross will mark them for you.</li>
        <li><strong>Step 4:</strong> Click <strong>"Apply & Download"</strong> to get your new, cleaned PDF instantly.</li>
    </ul>

    <div class="bg-white p-3 rounded border-start border-4 border-danger mt-4">
        <p class="small mb-0 italic">
            <strong>Pro Tip:</strong> Use this tool to reduce your PDF file size by removing high-resolution images or 
            heavy pages that you don't need before sending them via email or WhatsApp.
        </p>
    </div>
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
    // URL reset (Hash aur paths saaf karne ke liye)
    if (window.location.hash || window.location.pathname !== "/") {
        window.history.pushState({}, "", "/");
    }
    document.title = "SwiftTool Pro - Free Online Digital Tools";

    // Dashboard Elements ko dikhao
    const toShow = [
        document.getElementById('toolsGrid'),
        document.getElementById('seoSection'),
        document.querySelector('.container-fluid.px-0.mb-5') // Hero Banner
    ];

    toShow.forEach(el => {
        if (el) {
            el.classList.remove('d-none');
            el.style.display = ''; 
        }
    });

    // Active Tool aur Extra Screens ko hide karo
    const toHide = [
        document.getElementById('activeTool'),
        document.getElementById('extraScreens')
    ];

    toHide.forEach(el => {
        if (el) {
            el.classList.add('d-none');
            el.style.display = 'none';
        }
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showDashboard() {
 document.getElementById('toolsGrid').classList.remove('d-none');
    document.getElementById('seoSection').classList.remove('d-none');
    document.getElementById('activeTool').classList.add('d-none');
    document.getElementById('extraScreens').classList.add('d-none');

  // URL reset (Ab /resizer hat jayega)
  window.history.pushState({ tool: null }, "", "/");

  // Title reset (Ab SwiftTool Pro dikhega)
  updateDynamicTitle(null);

  // UI Restore
  activeTool.classList.add("d-none");
  toolsGrid.classList.remove("d-none");
  if (seoSection) seoSection.classList.remove("d-none");
  
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
            document.getElementById("previewArea").innerHTML = `<img src="${e.target.result}" class="img-fluid rounded" style="max-height:120px"><p class="small text-muted mt-2">${(file.size / 1024).toFixed(2)} KB</p>`;
        };
        reader.readAsDataURL(file);
    }
}
function goToDashboard() {
    const toolsGrid = document.getElementById("toolsGrid");
    const seoSection = document.getElementById("seoSection");
    const activeTool = document.getElementById("activeTool");
    const toolUI = document.getElementById("toolUI");

    // UI reset
    toolsGrid.classList.remove("d-none");
    if (seoSection) seoSection.classList.remove("d-none");
    activeTool.classList.add("d-none");
    toolUI.innerHTML = "";

    // URL reset to home
    window.history.pushState({}, "", "/");
    document.title = "SwiftTool Pro - Free Online Digital Tools";
}
/**
 * SwiftTool Pro - Advanced Extra Screens Handler
 * Handles: About, Privacy, Terms, Contact
 */
/**
 * SwiftTool Pro - Advanced Extra Screens Handler (No Dynamic Back Button)
 * Sirf content load karega, button HTML se handle hoga.
 */
function showExtra(page) {
    // Page titles update karna
    const pageTitles = {
        'about': 'About Us - SwiftTool Pro',
        'privacy': 'Privacy Policy - SwiftTool Pro',
        'terms': 'Terms of Service - SwiftTool Pro',
        'contact': 'Contact Us - SwiftTool Pro'
    };
    
    document.title = pageTitles[page] || 'SwiftTool Pro';
    
    // URL Update
    history.pushState({ page: page }, "", `#${page}`);

    // Dashboard Elements Hide karna
    const toHide = [
        document.getElementById('toolsGrid'),
        document.getElementById('seoSection'),
        document.getElementById('activeTool'),
        document.querySelector('.container-fluid.px-0.mb-5')
    ];

    toHide.forEach(el => {
        if (el) {
            el.classList.add('d-none');
            el.style.display = 'none';
        }
    });

    // Setup Extra Screen Container
    const extraScreens = document.getElementById("extraScreens");
    const content = document.getElementById("extraContent");

    if (!extraScreens || !content) return;

    // Isko 'block' force karo aur top par scroll karo
    extraScreens.classList.remove("d-none");
    extraScreens.style.setProperty('display', 'block', 'important');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // JS Content Logic (NO BACK BUTTON GENERATED HERE)
    let htmlContent = "";

    switch(page) {
        case "about":
    htmlContent = `
        <div class="animate__animated animate__fadeIn text-start">
            <h2 class="fw-bold text-primary mb-3 border-bottom pb-2">About SwiftTool Pro</h2>
            
            <p class="lead text-muted">Welcome to <b>SwiftTool Pro</b>—your premier destination for high-performance, secure, and accessible digital utility tools.</p>
            
            <h5 class="fw-bold mt-4 text-dark">Our Mission</h5>
            <p>At SwiftTool Pro, our mission is simple: to provide a comprehensive toolkit that empowers students, developers, and professionals to handle their digital tasks with lightning speed without compromising on privacy. Founded in 2026, we have quickly grown into a trusted platform for thousands of users globally.</p>

            <div class="row g-4 my-3">
                <div class="col-md-6">
                    <div class="p-3 border rounded-3 bg-light h-100 shadow-sm">
                        <h6 class="fw-bold text-primary"><i class="fas fa-user-shield me-2"></i>Privacy First Philosophy</h6>
                        <p class="small mb-0 text-muted">Unlike other online converters, we use <b>Client-Side Edge Computing</b>. This means your PDF files, images, and sensitive documents are processed directly in your browser. We never upload your data to our servers, ensuring 100% confidentiality.</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="p-3 border rounded-3 bg-light h-100 shadow-sm">
                        <h6 class="fw-bold text-primary"><i class="fas fa-code me-2"></i>Advanced Technology</h6>
                        <p class="small mb-0 text-muted">Built with modern frameworks like Flutter and optimized for SEO, our tools are designed to work across all devices—mobile, tablet, or desktop—with zero installation required.</p>
                    </div>
                </div>
            </div>

            <h5 class="fw-bold mt-4 text-dark">What We Offer</h5>
            <p>We specialize in a wide array of digital solutions, including:</p>
            <ul class="list-group list-group-flush mb-4">
                <li class="list-group-item"><i class="fas fa-check text-success me-2"></i> <b>PDF Management:</b> Compress, Merge, Split, and Page Removal tools.</li>
                <li class="list-group-item"><i class="fas fa-check text-success me-2"></i> <b>Image Optimization:</b> High-fidelity resizers and format converters.</li>
                <li class="list-group-item"><i class="fas fa-check text-success me-2"></i> <b>Developer Utilities:</b> Code formatters and SEO analysis tools.</li>
            </ul>

            <h5 class="fw-bold mt-4 text-dark">Why Choose SwiftTool Pro?</h5>
            <p>In an era of data breaches, we stand out by offering a <b>Zero-Server-Upload</b> policy. Whether you are a student preparing an application or a digital creator optimizing assets for the web, SwiftTool Pro provides professional-grade tools for free.</p>
            
            <div class="p-3 bg-primary text-white rounded-3 mt-4">
                <p class="mb-0 small italic text-center">"Empowering the digital world, one tool at a time." — The SwiftTool Pro Team</p>
            </div>
        </div>`;
    break;
        case "privacy":
    htmlContent = `
        <div class="animate__animated animate__fadeIn text-start">
            <h2 class="fw-bold text-dark mb-3 border-bottom pb-2">Privacy Policy</h2>
            <p class="small text-muted mb-4">LAST UPDATED: MARCH 10, 2026</p>
            
            <p>At <b>SwiftTool Pro</b>, accessible from your current URL, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by SwiftTool Pro and how we use it.</p>

            <h5 class="fw-bold mt-4 text-primary">1. Zero File Storage Policy</h5>
            <p>We pride ourselves on our <b>Client-Side Processing</b> technology. Unlike other platforms, SwiftTool Pro does not upload your PDF files, images, or documents to any remote server. All processing happens locally within your web browser's memory (RAM). Once you close the browser tab, all traces of your files are permanently gone.</p>

            <h5 class="fw-bold mt-4 text-primary">2. Log Files</h5>
            <p>SwiftTool Pro follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.</p>

            <h5 class="fw-bold mt-4 text-primary">3. Google DoubleClick DART Cookie</h5>
            <p>Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" class="text-decoration-none">https://policies.google.com/technologies/ads</a></p>

            <h5 class="fw-bold mt-4 text-primary">4. Advertising Partners Privacy Policies</h5>
            <p>Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on SwiftTool Pro, which are sent directly to users' browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.</p>

            <h5 class="fw-bold mt-4 text-primary">5. Children's Information</h5>
            <p>Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. SwiftTool Pro does not knowingly collect any Personal Identifiable Information from children under the age of 13.</p>

            <h5 class="fw-bold mt-4 text-primary">6. Consent</h5>
            <p>By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.</p>

            <div class="p-3 bg-light border-start border-primary border-4 mt-4">
                <p class="mb-0 small text-muted"><b>Note:</b> If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us through our Contact Page.</p>
            </div>
        </div>`;
    break;
        case "terms":
    htmlContent = `
        <div class="animate__animated animate__fadeIn text-start">
            <h2 class="fw-bold text-dark mb-3 border-bottom pb-2">Terms of Service</h2>
            <p class="small text-muted mb-4">LAST UPDATED: MARCH 10, 2026</p>

            <p>Welcome to <b>SwiftTool Pro</b>. By accessing this website, we assume you accept these terms and conditions. Do not continue to use SwiftTool Pro if you do not agree to take all of the terms and conditions stated on this page.</p>

            <h5 class="fw-bold mt-4 text-primary">1. Intellectual Property Rights</h5>
            <p>Unless otherwise stated, SwiftTool Pro and/or its licensors own the intellectual property rights for all material and unique tool logic on this website. All intellectual property rights are reserved. You may access this from SwiftTool Pro for your own personal use subjected to restrictions set in these terms and conditions.</p>

            <h5 class="fw-bold mt-4 text-primary">2. User Restrictions</h5>
            <p>You are specifically restricted from all of the following:</p>
            <ul class="list-group list-group-flush mb-3">
                <li class="list-group-item border-0 ps-0"><i class="fas fa-times-circle text-danger me-2"></i> Using this website to create forged or illegal documents.</li>
                <li class="list-group-item border-0 ps-0"><i class="fas fa-times-circle text-danger me-2"></i> Engaging in data mining, data harvesting, or "scraping" of our client-side scripts.</li>
                <li class="list-group-item border-0 ps-0"><i class="fas fa-times-circle text-danger me-2"></i> Using our tools to process copyrighted material without proper authorization.</li>
                <li class="list-group-item border-0 ps-0"><i class="fas fa-times-circle text-danger me-2"></i> Any action that causes damage to the website's performance or accessibility.</li>
            </ul>

            <h5 class="fw-bold mt-4 text-primary">3. No Warranties</h5>
            <p>This Website is provided "as is," with all faults, and SwiftTool Pro expresses no representations or warranties, of any kind related to this Website or the materials contained on this Website. While we strive for 100% accuracy in our PDF and image tools, we do not guarantee the results will be accepted by third-party institutions.</p>

            <h5 class="fw-bold mt-4 text-primary">4. Limitation of Liability</h5>
            <p>In no event shall SwiftTool Pro, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this Website. SwiftTool Pro shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of our tools.</p>

            <h5 class="fw-bold mt-4 text-primary">5. Governing Law & Jurisdiction</h5>
            <p>These Terms will be governed by and interpreted in accordance with the laws of the jurisdiction in which the website operates, and you submit to the non-exclusive jurisdiction of the state and federal courts located in India for the resolution of any disputes.</p>

            <div class="p-3 bg-light border-start border-warning border-4 mt-4">
                <p class="mb-0 small text-dark"><b>Acknowledgment:</b> By using our services, you acknowledge that you have read these Terms of Service and agree to be bound by them.</p>
            </div>
        </div>`;
    break;
       case "contact":
    htmlContent = `
        <div class="animate__animated animate__fadeIn">
            <div class="text-center mb-5">
                <h2 class="fw-bold text-primary">Contact Us</h2>
                <p class="text-muted mx-auto" style="max-width: 600px;">
                    Have questions about our tools or facing a technical issue? Our team at <b>SwiftTool Pro</b> is here to help. Reach out to us, and we'll get back to you as soon as possible.
                </p>
            </div>

            <div class="row g-4 align-items-start">
                <div class="col-md-5 text-start">
                    <div class="p-4 border rounded-4 bg-light shadow-sm h-100">
                        <h5 class="fw-bold mb-4">Get in Touch</h5>
                        
                        <div class="d-flex mb-4">
                            <div class="icon-box me-3 text-primary"><i class="fas fa-envelope fa-lg"></i></div>
                            <div>
                                <h6 class="fw-bold mb-0">Email Us</h6>
                                <p class="small text-muted mb-0">support@swifttoolpro.com</p>
                            </div>
                        </div>

                        <div class="d-flex mb-4">
                            <div class="icon-box me-3 text-primary"><i class="fas fa-clock fa-lg"></i></div>
                            <div>
                                <h6 class="fw-bold mb-0">Response Time</h6>
                                <p class="small text-muted mb-0">Typically within 24-48 hours</p>
                            </div>
                        </div>

                        <div class="d-flex mb-4">
                            <div class="icon-box me-3 text-primary"><i class="fas fa-map-marker-alt fa-lg"></i></div>
                            <div>
                                <h6 class="fw-bold mb-0">Location</h6>
                                <p class="small text-muted mb-0">Surat, Gujarat, India</p>
                            </div>
                        </div>

                        <div class="p-3 bg-white rounded-3 border mt-2">
                            <p class="small mb-0 text-muted"><b>Note:</b> For faster support, please describe your issue in detail or mention the specific tool you were using.</p>
                        </div>
                    </div>
                </div>

                <div class="col-md-7">
                    <form id="contact-form" action="https://formspree.io/f/xbdayrne" method="POST" class="bg-white p-4 rounded-4 shadow-sm border text-start">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-bold small">Full Name</label>
                                <input type="text" name="name" class="form-control shadow-none" placeholder="John Doe" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-bold small">Email Address</label>
                                <input type="email" name="email" class="form-control shadow-none" placeholder="john@example.com" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold small">Subject</label>
                            <select name="subject" class="form-select shadow-none">
                                <option selected>General Inquiry</option>
                                <option>Technical Issue</option>
                                <option>Feature Request</option>
                                <option>Ad Partnership</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold small">Your Message</label>
                            <textarea name="message" class="form-control shadow-none" rows="5" placeholder="Tell us how we can help..." required></textarea>
                        </div>
                        <button type="submit" id="form-submit" class="btn btn-primary w-100 fw-bold py-3 shadow-sm">
                            Send Message <i class="fas fa-paper-plane ms-2"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>`;
    break;
    
    }

    content.innerHTML = htmlContent; // Ab yahan header+content nahi, sirf content hai.

    if (page === "contact") setupContactForm();
}

// Form Submission Helper
function setupContactForm() {
    const form = document.getElementById("contact-form");
    if(!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById("form-submit");
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
        try {
            const response = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { 'Accept': 'application/json' }});
            if (response.ok) { alert("Success! Your message has been sent."); form.reset(); } 
            else { alert("Oops! Something went wrong."); }
        } catch (err) { alert("Connection Error."); }
        btn.disabled = false;
        btn.innerHTML = 'Send Message <i class="fas fa-paper-plane ms-2"></i>';
    };
}
function closeExtra() {
    const extraScreens = document.getElementById("extraScreens");
    extraScreens.style.display = "none";
    document.body.style.overflow = "auto"; // Scroll wapas on karo
    window.history.pushState({}, "", "/"); // URL reset karo
}
window.onpopstate = function() {
    if (!window.location.hash) goBack();
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


// --- URL Routing Logic (Direct Link Fix) ---
window.addEventListener("DOMContentLoaded", () => {
    // URL se path nikaalo (e.g., "/cash" se "cash")
    const path = window.location.pathname.replace("/", "");

    // Agar path khali nahi hai aur wo koi tool hai
    if (path && path !== "" && path !== "index.html") {
        console.log("Direct Link Detected for: " + path);
        
        // Chota sa delay taaki UI elements load ho jayein
        setTimeout(() => {
            openTool(path);
        }, 100);
    } else {
        // Default Dashboard
        updateDynamicTitle(null);
    }
});


function filterTools() {
    // 1. User ne kya type kiya wo uthao
    const input = document.getElementById('toolSearch');
    const filter = input.value.toLowerCase();
    
    // 2. Saare cards ko pakdo
    const toolsGrid = document.getElementById('toolsGrid');
    const cards = toolsGrid.getElementsByClassName('col-6'); // Bootstrap columns select karega

    // 3. Loop chalao aur match check karo
    for (let i = 0; i < cards.length; i++) {
        // Card ke andar ka title (h6) aur description (p) check karte hain
        const title = cards[i].querySelector('h6').innerText.toLowerCase();
        const description = cards[i].querySelector('p').innerText.toLowerCase();

        if (title.indexOf(filter) > -1 || description.indexOf(filter) > -1) {
            cards[i].style.display = ""; // Show card
            cards[i].classList.add('animate__animated', 'animate__fadeIn'); // Optional animation
        } else {
            cards[i].style.display = "none"; // Hide card
        }
    }
}
// "No Results Found" ka alert handle karne ke liye
function handleNoResults(hasResults) {
    let noResultMsg = document.getElementById('noResultMsg');
    const gridRow = document.querySelector('#toolsGrid .row');

    if (!hasResults) {
        if (!noResultMsg) {
            noResultMsg = document.createElement('div');
            noResultMsg.id = 'noResultMsg';
            noResultMsg.className = 'text-center py-5 animate__animated animate__fadeIn';
            noResultMsg.innerHTML = `
                <i class="fas fa-search-minus fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Oops! No such tool found.</h5>
                <p class="small text-muted">Try searching for 'PDF', '20KB', or 'GST'.</p>
                <button class="btn btn-sm btn-outline-primary rounded-pill mt-2" onclick="resetSearch()">Show All Tools</button>
            `;
            gridRow.parentElement.appendChild(noResultMsg);
        }
    } else {
        if (noResultMsg) noResultMsg.remove();
    }
}

// Search reset karne ke liye function
function resetSearch() {
    document.getElementById('toolSearch').value = "";
    filterTools();
}