// --- System Back Button Fix ---
window.onpopstate = function(event) {
    // Agar koi tool ya extra screen khuli hai, toh use band karo
    const toolsGrid = document.getElementById("toolsGrid");
    if (toolsGrid.classList.contains("d-none")) {
        goBack(); // Ye aapka purana function hai jo screens switch karta hai
    }
};

// Tool open karte waqt history mein ek "state" push karo
const originalOpenTool = openTool;
openTool = function(name) {
    history.pushState({page: 'tool'}, ""); // History mein entry add ki
    originalOpenTool(name);
};

// Extra screens ke liye bhi same logic
const originalShowExtra = showExtra;
showExtra = function(page) {
    history.pushState({page: 'extra'}, "");
    originalShowExtra(page);
};

const openAd = () =>
    window.open(
        "https://www.effectivegatecpm.com/uhv7f7jam?key=621c144ec67a64c9e4ccf13b92fb867b",
        "_blank",
    );

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
    const grid = document.getElementById("toolsGrid");
    const active = document.getElementById("activeTool");
    const toolUI = document.getElementById("toolUI");

    // Smooth Transition
    grid.classList.add("d-none");
    active.classList.remove("d-none");
    active.classList.add("animate__animated", "animate__fadeInUp");

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
                   <button class="btn btn-outline-primary mt-3" onclick="openAd(); setTimeout(() => window.print(), 800);">
    <i class="fas fa-print me-2"></i>Print Receipt
</button>
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
            </div>`;
    } else if (toolName === "qrcode") {
        toolUI.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="fas fa-qrcode me-2 text-dark"></i>QR Generator</h3>
                <button class="btn btn-sm btn-outline-danger" onclick="resetQR()"><i class="fas fa-trash me-1"></i> Reset</button>
            </div><hr>
            <input type="text" id="qrText" class="form-control mb-3" placeholder="Enter text or URL">
            <button class="btn btn-dark w-100" onclick="openAd(); generateQR()">Generate QR Code</button>
            <div id="qrResult" class="text-center mt-4"></div>`;
    } else if (toolName === "voice") {
        toolUI.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="fas fa-volume-up me-2 text-warning"></i>AI Voice</h3>
                <button class="btn btn-sm btn-outline-danger" onclick="resetVoice()"><i class="fas fa-trash me-1"></i> Clear</button>
            </div><hr>
            <textarea id="speechText" class="form-control mb-3" rows="4" placeholder="Type text here..."></textarea>
            <button class="btn btn-warning w-100 fw-bold" onclick="speakText()">Speak Now</button>`;
    } else if (toolName === "pdfToImg") {
        toolUI.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="fas fa-images me-2 text-info"></i>PDF to Image</h3>
                <button class="btn btn-sm btn-outline-danger" onclick="resetPdfToImg()"><i class="fas fa-trash me-1"></i> Clear</button>
            </div><hr>
            <input type="file" id="pdfInput" accept="application/pdf" class="form-control mb-3">
            <button class="btn btn-info w-100 fw-bold" id="pdfImgBtn" onclick="convertPdfToImg()">Extract All Pages</button>
            <div id="pdfPreview" class="row g-3 mt-4"></div>`;
    }
}

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

// Images to PDF
async function generatePDF() {
    const files = document.getElementById("imageInput").files;
    if (files.length === 0)
        return showNotify("error", "Please select images first!");

    const btn = document.getElementById("pdfBtn");
    btn.disabled = true;
    btn.innerHTML = "Processing...";

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        for (let i = 0; i < files.length; i++) {
            const data = await readFileAsDataURL(files[i]);
            if (i > 0) doc.addPage();
            doc.addImage(data, "JPEG", 10, 10, 190, 277);
        }
        openAd();
        doc.save("Converted.pdf");
        showNotify("success", "PDF Downloaded Successfully!");
        setTimeout(() => {
            openAd();
            showNotify("success", "PDF Downloaded Successfully!");
        }, 1000);
    } catch (e) {
        showNotify("error", "Failed to generate PDF.");
    }
    btn.disabled = false;
    btn.innerHTML = "Generate PDF";
}

// Image Compressor
async function compressImage() {
    const file = document.getElementById("compressInput").files[0];
    if (!file) return showNotify("error", "Please select an image!");

    const quality = parseFloat(document.getElementById("qualityRange").value);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `Compressed_${file.name}`;

                    // Pehle file ko body mein add karke click karwana zaroori hai
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a); // Download start hone ke baad remove kar do

                    // Ab ad kholenge (0.5 second ka delay taki download trigger ho jaye)
                    setTimeout(() => {
                        openAd();
                        showNotify("success", "Image Compressed & Downloaded!");
                    }, 800);
                },
                "image/jpeg",
                quality,
            );
        };
    };
}

// PDF to Image (Fully Fixed)
async function convertPdfToImg() {
    const file = document.getElementById("pdfInput").files[0];
    if (!file) return showNotify("error", "Please select a PDF file!");
    openAd();

    const btn = document.getElementById("pdfImgBtn");
    btn.disabled = true;
    btn.innerHTML = "Extracting...";
    showNotify("info", "Converting PDF... Please wait.");

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async function () {
        try {
            const typedarray = new Uint8Array(this.result);
            const pdfjsLib = window["pdfjs-dist/build/pdf"];
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            const previewArea = document.getElementById("pdfPreview");
            previewArea.innerHTML = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement("canvas");
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: canvas.getContext("2d"), viewport })
                    .promise;

                const imgData = canvas.toDataURL("image/jpeg");
                previewArea.innerHTML += `
                    <div class="col-6 col-md-3 text-center">
                        <img src="${imgData}" class="img-fluid border rounded shadow-sm">
                        <a href="${imgData}" download="Page_${i}.jpg" class="btn btn-sm btn-link">Download Page ${i}</a>
                    </div>`;
            }
            showNotify("success", `Successfully extracted ${pdf.numPages} pages!`);
        } catch (e) {
            showNotify("error", "Error reading PDF file.");
        }
        btn.disabled = false;
        btn.innerHTML = "Extract All Pages";
    };
}

// QR Code
function generateQR() {
    const text = document.getElementById("qrText").value;
    if (!text.trim()) return showNotify("error", "Enter text/URL for QR!");
    openAd();
    document.getElementById("qrResult").innerHTML = `
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(text)}" class="img-fluid shadow rounded">
        <p class="text-muted mt-2">Right-click to save image</p>`;
    showNotify("success", "QR Code Generated!");
    setTimeout(openAd, 1500);
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

function resetPDFTool() {
    document.getElementById("imageInput").value = "";
    showNotify("info", "File Cleared");
}
function resetCompressor() {
    document.getElementById("compressInput").value = "";
    document.getElementById("previewArea").innerHTML = "Preview";
    showNotify("info", "Cleared");
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
function resetPdfToImg() {
    document.getElementById("pdfInput").value = "";
    document.getElementById("pdfPreview").innerHTML = "";
    showNotify("info", "PDF Cleared");
}

function goBack() {
    document.getElementById("toolUI").innerHTML = "";
    document.getElementById("activeTool").classList.add("d-none");
    document.getElementById("toolsGrid").classList.remove("d-none");
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
    document.getElementById("toolsGrid").classList.add("d-none");
    document.getElementById("activeTool").classList.add("d-none");
    document.getElementById("extraScreens").classList.remove("d-none");
    const content = document.getElementById("extraContent");

    if (page === "about") {
        content.innerHTML = `
            <h2 class="fw-bold text-primary mb-4">About SwiftTool Pro</h2>
            <p>SwiftTool Pro is your all-in-one digital companion designed to simplify repetitive daily tasks. From managing cash to converting documents, we bring professional-grade tools directly to your browser.</p>
            <div class="row mt-4">
                <div class="col-md-6"><h5><i class="fas fa-user-shield text-success me-2"></i> 100% Secure</h5><p>All processing happens locally in your browser. Your data never leaves your device.</p></div>
                <div class="col-md-6"><h5><i class="fas fa-bolt text-warning me-2"></i> Lightning Fast</h5><p>Optimized for speed, no server-side waiting time.</p></div>
            </div>`;
    } else if (page === "how") {
        content.innerHTML = `
            <h2 class="fw-bold text-info mb-4">How It Works</h2>
            <div class="list-group list-group-flush">
                <div class="list-group-item bg-transparent border-0 ps-0 mb-3">
                    <span class="badge bg-info rounded-pill me-2">1</span> Choose any tool from the dashboard like Cash Counter or PDF Converter.
                </div>
                <div class="list-group-item bg-transparent border-0 ps-0 mb-3">
                    <span class="badge bg-info rounded-pill me-2">2</span> Upload your files or enter the required data in the tool interface.
                </div>
                <div class="list-group-item bg-transparent border-0 ps-0">
                    <span class="badge bg-info rounded-pill me-2">3</span> Click the action button to process and download your results instantly.
                </div>
            </div>`;
    } else if (page === "contact") {
        content.innerHTML = `
        <h2 class="fw-bold text-danger mb-4">Contact Us</h2>
        <p class="text-muted">Have a query or need a new tool? Fill out the form and our team will get back to you shortly.</p>
        
        <form id="contact-form" action="https://formspree.io/f/xbdayrne" method="POST">
            <div class="mb-3 mt-4 text-start">
                <label class="form-label fw-bold">Full Name</label>
                <input type="text" name="name" class="form-control" placeholder="Enter your name" required>
            </div>
            
            <div class="mb-3 text-start">
                <label class="form-label fw-bold">Email Address</label>
                <input type="email" name="email" class="form-control" placeholder="yourname@gmail.com" required>
            </div>
            
            <div class="mb-3 text-start">
                <label class="form-label fw-bold">Your Message</label>
                <textarea name="message" class="form-control" rows="4" placeholder="How can we help you?" required></textarea>
            </div>
            
            <button type="submit" id="form-submit" class="btn btn-danger w-100 fw-bold py-3 shadow-sm">
                <i class="fas fa-paper-plane me-2"></i> Send Message Now
            </button>
        </form>
        
        <div class="mt-4 pt-3 border-top text-center">
            <div class="d-flex align-items-center justify-content-center text-success mb-2">
                <i class="fas fa-shield-alt me-2"></i>
                <span class="fw-600">Secure & Encrypted Communication</span>
            </div>
            <p class="small text-muted mb-0">
                <i class="far fa-clock me-1"></i> Typical response time: <b>Within 24 hours</b>
            </p>
            <p class="x-small text-muted mt-2" style="font-size: 0.8rem;">
                Note: For security reasons, we only accept inquiries through this official verified form.
            </p>
        </div>`;

        // Form Submission Handling (AJAX)
        const form = document.getElementById("contact-form");
        form.onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById("form-submit");

            // Form ID Check (Taki aap bhul na jao)
            // --- Is hisse ko dhyan se replace karein ---

            // Form ID Check (Ab ye sirf tab error dega jab aapki ID missing hogi)
            if (
                form.action.includes("YOUR_FORM_ID_HERE") ||
                !form.action.includes("f/")
            ) {
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
    } else if (page === "terms") {
        content.innerHTML = `
            <h2 class="fw-bold text-dark mb-4">Terms & Privacy Policy</h2>
            <div style="max-height: 300px; overflow-y: auto;" class="pe-3 text-muted">
                <h6>1. Data Privacy</h6>
                <p>We do not store your images, PDFs, or any personal data on our servers. All operations are performed using Client-Side JavaScript.</p>
                <h6>2. Usage License</h6>
                <p>SwiftTool Pro is free to use for personal and commercial purposes.</p>
                <h6>3. Limitation of Liability</h6>
                <p>Tools are provided "as is" without warranty. We are not responsible for data loss due to browser crashes.</p>
            </div>`;
    }
}

// Update goBack function to handle extra screens too
function goBack() {
    document.getElementById("activeTool").classList.add("d-none");
    document.getElementById("extraScreens").classList.add("d-none");
    document.getElementById("toolsGrid").classList.remove("d-none");
    window.scrollTo(0, 0);
}
