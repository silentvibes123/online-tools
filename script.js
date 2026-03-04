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
  let metaDesc =
    "SwiftTool Pro offers free, secure, and fast digital tools like Image Resizer for SSC/UPSC, Cash Counter, PDF Converter, and AI Voice. No file uploads, 100% private.";

  // Tool wise Title and Description logic
  if (toolName === "cash") {
    newTitle = "Online Cash Counter & Denomination Calculator | SwiftTool Pro";
    metaDesc =
      "Calculate total cash with Indian currency denominations (₹2000 to ₹1). Generate and print professional cash receipts instantly for banks and shops.";
  } else if (toolName === "resizer") {
    newTitle =
      "Exam Photo Resizer (20KB - 50KB) for SSC, UPSC, Bank | SwiftTool Pro";
    metaDesc =
      "Perfectly resize your photos and signatures for SSC, UPSC, and IBPS exams. Compress to 20KB or 50KB with standard 350x450 dimensions without quality loss.";
  } else if (toolName === "age") {
    newTitle =
      "Accurate Age Calculator by Date of Birth - Exact Age | SwiftTool Pro";
    metaDesc =
      "Calculate your exact age in years, months, and days. Perfect for government job forms and calculating age eligibility for exams like SSC and UPSC.";
  } else if (toolName === "pdf") {
    newTitle =
      "Images to PDF Converter - High Quality & Secure | SwiftTool Pro";
    metaDesc =
      "Convert JPG, PNG, and WEBP images into a single high-quality PDF document. Fast, free, and works entirely in your browser for 100% privacy.";
  } else if (toolName === "compress") {
    newTitle =
      "Compress Image to 20KB & 50KB Online - Quality Optimizer | SwiftTool Pro";
    metaDesc =
      "Reduce image file size online without losing clarity. Best tool for optimizing photos for web use and online application forms.";
  } else if (toolName === "qrcode") {
    newTitle = "Free QR Code Generator for Text, URL & Contact | SwiftTool Pro";
    metaDesc =
      "Create custom QR codes for your website, business cards, or personal use for free. Instant download and high-resolution scan-ready QR codes.";
  } else if (toolName === "pdfToImg") {
    newTitle =
      "PDF to Image Converter Online - Extract High-Res JPG | SwiftTool Pro";
    metaDesc =
      "Convert PDF pages into high-quality JPEG/PNG images. Secure browser-based conversion—no files are uploaded to our servers.";
  } else if (toolName === "voice") {
    newTitle = "AI Voice - Free Text to Speech Online | SwiftTool Pro";
    metaDesc =
      "Convert your written text into a clear AI-powered human voice. Perfect for creating voiceovers and listening to long documents.";
  } else if (toolName === "merge") {
    newTitle = "Merge PDF Files Online - Combine PDF Fast | SwiftTool Pro";
    metaDesc =
      "Combine multiple PDF documents into one single file securely. Our PDF merger works offline in your browser for maximum data safety.";
  } else if (toolName === "split") {
    newTitle =
      "Split PDF Pages - Extract Specific Pages Online | SwiftTool Pro";
    metaDesc =
      "Extract pages from your PDF file or split one PDF into multiple documents instantly. Fast, free, and secure PDF splitting tool.";
  }
  else if (!toolName || toolName === "home") {
      newTitle = "SwiftTool Pro - Free Online Digital Toolkit & PDF Tools";
      metaDesc = "SwiftTool Pro offers free, secure, and fast digital tools like Image Resizer, Cash Counter, and PDF Converter.";
  }

  // --- Update Document Title ---
  document.title = newTitle;

  // --- Update Meta Description for SEO ---
  let metaDescriptionTag = document.querySelector('meta[name="description"]');
  if (metaDescriptionTag) metaDescriptionTag.setAttribute("content", metaDesc);
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

  window.history.pushState({ tool: toolName }, "", "/" + toolName);

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
    <p class="small text-muted"><strong>Why Privacy is Our Priority:</strong> Most online converters upload your personal photos to their cloud servers, which can be a huge privacy risk. Our <strong>Offline Image to PDF</strong> tool works entirely within your browser. This means your images never leave your device, making it the safest choice for sensitive documents like Aadhaar cards, PAN cards, or private certificates.</p>
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
    <p class="small text-muted"><strong>Why Choose SwiftTool Pro?</strong> 1. <strong>Privacy:</strong> Your personal photos are sensitive. We process them 100% offline in your browser, meaning your data never reaches any server. 2. <strong>Instant Download:</strong> No waiting, no watermarks, just high-quality resized images ready for upload. 3. <strong>Format Support:</strong> Works perfectly with JPG, JPEG, and PNG formats.</p>
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
    <p class="small text-muted"><strong>Data Protection:</strong> Since we use browser-side JavaScript technology, your documents are never uploaded to any external server. This "Offline-First" approach makes us the most trusted <strong>Private PDF Merger</strong> for handling bank statements, legal contracts, and personal records. You can merge your files even without an active internet connection once the tool is loaded.</p>
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
    <p class="small text-muted"><strong>Precise Page Extraction:</strong> You can define a custom range, such as "Page 5 to Page 10", and our tool will create a new PDF containing only those pages. The original file remains untouched. This <strong>Offline PDF Splitter</strong> ensures that the quality of images and the layout of text are preserved perfectly in the extracted document.</p>
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
           <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
    <h5 class="fw-bold text-info"><i class="fas fa-images me-2"></i> High-Resolution PDF to Image Converter</h5>
    <p class="small text-muted">Do you need to extract a specific page from a PDF as a high-quality photo? Our <strong>PDF to JPG Converter</strong> allows you to turn every page of a document into a separate image file instantly. This is essential for designers, social media managers, and students who need to share PDF content as snapshots on WhatsApp or Instagram.</p>
    <p class="small text-muted"><strong>Superior Quality:</strong> We use the industry-standard PDF.js library to render pages at high DPI, ensuring that the text remains sharp and the images inside the PDF do not lose their clarity. You can view all pages in a beautiful grid preview before deciding to download them. Our tool also provides a <strong>'Download All as ZIP'</strong> feature, saving you time when dealing with large documents.</p>
    <p class="small text-muted"><strong>Why Privacy Matters:</strong> Most online PDF tools keep a copy of your file on their server for hours. At SwiftTool Pro, your PDF is processed locally. Once you close the tab, everything is gone. This makes our tool the safest choice for bank statements, ID cards, and private certificates.</p>
    <p class="small text-muted"><strong>Technical Advantage:</strong> No software like Adobe Acrobat is required. Our browser-based solution works on any modern device, providing a seamless experience whether you are on a desktop or a mobile phone.</p>
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
            
            <div class="mt-5 p-4 bg-light rounded border text-start shadow-sm">
                <h5 class="fw-bold text-info"><i class="fas fa-file-image me-2"></i> High-Resolution PDF to JPG Converter</h5>
                <p class="small text-muted">Our tool allows you to convert complex PDF pages into high-quality JPEG images instantly. 
                <strong>Privacy First:</strong> The conversion happens entirely in your browser. No files are uploaded to any server, keeping your sensitive documents 100% private.</p>
                <p class="small text-muted mb-0"><strong>Why use this?</strong> Best for extracting charts, certificates, or snapshots from large PDF files without losing clarity.</p>
            </div>`;
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
    content = `
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
    <h5 class="fw-bold text-primary"><i class="fas fa-file-word me-2"></i> Best Offline Word to PDF Converter - 100% Private</h5>
    <p class="small text-muted">Converting <strong>DOCX to PDF</strong> is a daily necessity for students and professionals. However, most online converters upload your sensitive documents to their servers, posing a security risk. SwiftTool Pro solves this with our <strong>Browser-Based Word to PDF Converter</strong>. Your document stays on your computer throughout the entire process.</p>
    <p class="small text-muted"><strong>Professional Quality:</strong> Our tool preserves the original formatting of your Word document, including fonts, tables, bullet points, and images. Whether it's a resume, an assignment, or a business proposal, the output PDF will look exactly like the original Word file. We use advanced libraries like Mammoth.js to ensure high fidelity during the HTML-to-PDF transition.</p>
    <p class="small text-muted"><strong>Key Features:</strong> 1. <strong>Unlimited Conversions:</strong> No daily limits or subscriptions required. 2. <strong>No Registration:</strong> Start converting immediately without giving your email address. 3. <strong>Device Compatible:</strong> Works on Windows, Mac, Android, and iOS browsers. 4. <strong>Secure:</strong> Since it works offline, even your ISP cannot see the content of your converted documents.</p>
    <p class="small text-muted"><strong>SEO Guide:</strong> PDF is the standard for sharing documents because it locks the layout. Use our tool to convert your DOCX files before emailing them or uploading them to job portals to ensure your document looks professional on every screen.</p>
    </div>`;
  }

  // PDF to Text (Formatter) UI
  else if (toolName === "pdfToWord") {
    content = `
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
  // 1. Screens reset karo
  document.getElementById("activeTool").classList.add("d-none");
  document.getElementById("extraScreens").classList.add("d-none");

  // 2. Dashboard aur SEO section wapas dikhao
  document.getElementById("toolsGrid").classList.remove("d-none");
  if (document.getElementById("seoSection")) {
    document.getElementById("seoSection").classList.remove("d-none");
  }

  // 3. URL aur Title reset
  history.pushState(null, "", window.location.pathname);
  document.title =
    toolName.charAt(0).toUpperCase() + toolName.slice(1) + " | SwiftTool Pro";

  window.scrollTo(0, 0);
}
function showDashboard() {
  const toolsGrid = document.getElementById("toolsGrid");
  const seoSection = document.getElementById("seoSection");
  const activeTool = document.getElementById("activeTool");
  const toolUI = document.getElementById("toolUI");

  // 1. URL reset - Ab swifttoolpro.com/ ke baad kuch nahi dikhega
  window.history.pushState({ tool: null }, "", "/");

  // 2. Title & Meta Reset - Tool ka naam yahan se hat jayega
  updateDynamicTitle(null); 

  // 3. UI logic
  if (activeTool) activeTool.classList.add("d-none");
  if (toolUI) toolUI.innerHTML = ""; // Tool ka HTML saaf karo
  
  if (toolsGrid) toolsGrid.classList.remove("d-none");
  if (seoSection) seoSection.classList.remove("d-none");

  window.scrollTo(0, 0);
  console.log("Dashboard Restored: Title & URL Cleaned");
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
  history.pushState({ page: page }, "", `#${page}`);
  document.getElementById("toolsGrid").classList.add("d-none");
  document.getElementById("activeTool").classList.add("d-none");
  if (document.getElementById("seoSection")) {
    document.getElementById("seoSection").classList.add("d-none");
  }

  const extraScreens = document.getElementById("extraScreens");
  extraScreens.classList.remove("d-none");
  window.scrollTo(0, 0);
  const content = document.getElementById("extraContent");

  if (page === "about") {
    content.innerHTML = `
      <div class="text-start p-3">
        <h2 class="fw-bold text-primary mb-4 text-center">About SwiftTool Pro</h2>
        <p class="lead text-center"><b>Your Trusted Browser-Based Utility Hub</b></p>
        <p>SwiftTool Pro is a high-performance digital toolkit designed for students, professionals, and job seekers. Founded in 2026, we specialize in <b>exam-ready photo resizing</b> and <b>secure document conversion</b>. Our core philosophy is to provide premium features for free without compromising user data.</p>
        
        <h5 class="mt-4 text-primary"><i class="fas fa-microchip me-2"></i>Advanced Edge Technology</h5>
        <p>Unlike traditional converters, SwiftTool Pro utilizes <b>Client-Side Processing</b>. This means your files are processed directly on your device using high-speed JavaScript libraries. Your sensitive documents never touch a cloud server, ensuring absolute privacy and security.</p>

        <h5 class="mt-4 text-primary"><i class="fas fa-check-double me-2"></i>Our Specialized Tools:</h5>
        <ul class="list-group list-group-flush mb-4">
            <li class="list-group-item"><b>✓ Exam Resizer:</b> 20KB/50KB target compression for SSC & UPSC.</li>
            <li class="list-group-item"><b>✓ PDF Suite:</b> Merge, Split, and Convert with Zero Loss.</li>
            <li class="list-group-item"><b>✓ Business Tools:</b> Smart Cash Counter and QR Generator.</li>
        </ul>

        <div class="alert alert-primary mt-3 text-center">
            <b>Safety First:</b> We are committed to a safe, ad-supported environment for free users worldwide.
        </div>
      </div>`;
  } else if (page === "terms") {
    content.innerHTML = `
      <div class="text-start p-3">
        <h2 class="fw-bold text-dark mb-4 text-center">Privacy Policy & Terms</h2>
        <p class="small text-muted text-center">Effective Date: February 2026</p>
        
        <h5 class="mt-4 text-primary">1. Data Privacy Policy</h5>
        <p>We respect your privacy. All file processing (Image Compression, PDF conversions) occurs locally. <b>We do not upload your files to our servers.</b> No document data is permanently stored on SwiftTool Pro.</p>

        <h5 class="mt-4 text-primary">2. Google AdSense & Cookies</h5>
        <p>SwiftTool Pro uses cookies to personalize content and ads. We use <b>Google AdSense</b> to serve ads. Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits. You may opt out of personalized advertising by visiting Google Ad Settings.</p>

        <h5 class="mt-4 text-primary">3. Terms of Use</h5>
        <ul>
            <li>Tools are free for personal use.</li>
            <li>Users must verify outputs before official exam submissions.</li>
            <li>Redistribution or automated scraping of our tools is prohibited.</li>
        </ul>

        <p class="mt-4 small text-muted">By using SwiftTool Pro, you agree to our Terms of Service and Data Protection guidelines.</p>
      </div>`;
  } else if (page === "contact") {
    content.innerHTML = `
        <h2 class="fw-bold text-primary mb-4 text-center">Contact Us</h2>
        <p class="text-muted text-center">Questions? Feedback? We'd love to hear from you.</p>
        <form id="contact-form" action="https://formspree.io/f/xbdayrne" method="POST">
            <div class="mb-3 text-start">
                <label class="form-label fw-bold small">Full Name</label>
                <input type="text" name="name" class="form-control" placeholder="Enter your name" required>
            </div>
            <div class="mb-3 text-start">
                <label class="form-label fw-bold small">Official Email Address</label>
                <input type="email" name="email" class="form-control" placeholder="email@example.com" required>
            </div>
            <div class="mb-3 text-start">
                <label class="form-label fw-bold small">Message / Inquiry</label>
                <textarea name="message" class="form-control" rows="4" placeholder="How can we assist you today?" required></textarea>
            </div>
            <button type="submit" id="form-submit" class="btn btn-primary w-100 fw-bold py-3">Send Message</button>
        </form>`;

    const form = document.getElementById("contact-form");
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = document.getElementById("form-submit");
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
          showNotify("success", "Message Sent! We will get back to you soon.");
          form.reset();
        } else {
          showNotify("error", "Error! Please check your connection.");
        }
      } catch (error) {
        showNotify("error", "Network error. Try again later.");
      }
      btn.disabled = false;
      btn.innerHTML = "Send Message";
    };
  }
}
window.onpopstate = function (event) {
  if (event.state && event.state.tool) {
    // Agar kisi tool par wapas ja rahe ho
    openTool(event.state.tool);
  } else {
    // Agar dashboard (home) par wapas aa rahe ho
    const activeTool = document.getElementById("activeTool");
    const toolsGrid = document.getElementById("toolsGrid");
    const seoSection = document.getElementById("seoSection");

    activeTool.classList.add("d-none");
    toolsGrid.classList.remove("d-none");
    if (seoSection) seoSection.classList.remove("d-none");
    
    // Forcefully reset title on back button
    updateDynamicTitle(null); 
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
