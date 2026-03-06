// 1. Initial Setup
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

let extractedImages = [];

// 2. Merge PDF Logic
async function mergePDFs() {
    const files = document.getElementById("mergeInput").files;
    if (files.length < 2) return showNotify("error", "Kam se kam 2 PDF select karein!");

    const btn = document.getElementById("mergeBtn");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Merging Files...`;

    try {
        const { PDFDocument } = window.PDFLib;
        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        
        // --- AD TRIGGER HERE ---
        saveAsFile(blob, "SwiftTool_Merged.pdf");
        showNotify("success", "PDF Merged Successfully!");
    } catch (e) {
        showNotify("error", "Merging failed!");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// 3. Split PDF Logic
async function splitPDF() {
    const file = document.getElementById("splitInput").files[0];
    const start = parseInt(document.getElementById("startPage").value);
    const end = parseInt(document.getElementById("endPage").value);

    if (!file || isNaN(start) || isNaN(end)) return showNotify("error", "invalid range!");

    const btn = document.getElementById("splitBtn");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Splitting...`;

    try {
        const { PDFDocument } = window.PDFLib;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const totalPages = pdf.getPageCount();

        if (start < 1 || end > totalPages || start > end) {
            throw new Error(`Invalid range! Total pages: ${totalPages}`);
        }

        const newPdf = await PDFDocument.create();
        const pagesToCopy = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
        const copiedPages = await newPdf.copyPages(pdf, pagesToCopy);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });

        // --- AD TRIGGER HERE ---
        saveAsFile(blob, `SwiftTool_Split_${start}_to_${end}.pdf`);
        showNotify("success", "PDF Split Successfully!");
    } catch (e) {
        showNotify("error", e.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// 4. PDF to Image Logic
async function convertPdfToImg() {
    const file = document.getElementById("pdfInput").files[0];
    if (!file) return showNotify("error", "Please select a PDF file!");

    const btn = document.getElementById("pdfImgBtn");
    const downloadAllBtn = document.getElementById("downloadAllBtn");
    const previewArea = document.getElementById("pdfPreview");
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Extracting...';

    extractedImages = [];
    previewArea.innerHTML = "";

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;

            const imgData = canvas.toDataURL("image/jpeg", 0.9);
            extractedImages.push({ name: `Page_${i}.jpg`, data: imgData });

            const card = document.createElement("div");
            card.className = "col-6 col-md-3 text-center mb-3 animate__animated animate__fadeIn";
            card.innerHTML = `
                <img src="${imgData}" class="img-fluid border rounded shadow-sm mb-2">
                <button onclick="downloadSingleImage('${imgData}', 'Page_${i}.jpg')" class="btn btn-sm btn-outline-info">Save P${i}</button>
            `;
            previewArea.appendChild(card);
        }

        downloadAllBtn.classList.remove("d-none");
        showNotify("success", `${pdf.numPages} pages extracted!`);
    } catch (e) {
        showNotify("error", "Error extracting images.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// 5. ZIP Download Logic
async function downloadAllAsZip() {
    if (extractedImages.length === 0) return showNotify("error", "Extract images first!");

    const btn = document.getElementById("downloadAllBtn");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Zipping...';

    try {
        if (!window.JSZip) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");

        const zip = new JSZip();
        extractedImages.forEach((img) => {
            const base64Data = img.data.split(",")[1];
            zip.file(img.name, base64Data, { base64: true });
        });

        const content = await zip.generateAsync({ type: "blob" });
        saveAsFile(content, "SwiftTool_Images.zip");
        showNotify("success", "ZIP Downloaded!");
    } catch (e) {
        showNotify("error", "ZIP failed!");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// --- HELPERS (BUG FIX FOR NEW TAB) ---

function saveAsFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }, 200);
}

function downloadSingleImage(data, name) {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = data;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 200);
}

// --- PDF to Text (Formatter) Logic ---
window.processFormatPDF = async function(file) {
    if (!file || file.type !== "application/pdf") {
        return showNotify("error", "please upload valid pdf file!");
    }

    showNotify("info", "Extracting text....");
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(" ");
            fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }

        // UI Update
        document.getElementById("pdfUploadZone").classList.add("d-none");
        document.getElementById("editorZone").classList.remove("d-none");
        document.getElementById("pdfEditor").value = fullText;
        
        showNotify("success", "Text extracted.");
    } catch (err) {
        console.error(err);
        showNotify("error", "cannot extract pdf text.");
    }
};

window.downloadFormattedPDF = function() {
    const text = document.getElementById("pdfEditor").value;
    if (!text) return showNotify("error", "pdf cannot be empty!");

    const element = document.createElement("div");
    element.style.padding = "40px";
    element.style.fontSize = "14px";
    element.style.whiteSpace = "pre-wrap"; // Line breaks maintain karne ke liye
    element.innerText = text;

    const opt = {
        margin: [0.7, 0.7],
        filename: 'Formatted_Document.pdf',
        jsPDF: { unit: 'in', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        showNotify("success", "Formatted PDF saved!");
    });
};

async function handleRemovePages() {
    const fileInput = document.getElementById('removeInput');
    const pagesInput = document.getElementById('pageNumbers');
    const btn = document.getElementById('removeBtn');

    if (!fileInput.files[0]) {
        alert("Select PDF !!");
        return;
    }
    if (!pagesInput.value) {
        alert("enter a page number! (e.g. 1)");
        return;
    }

    try {
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Removing...';
        btn.disabled = true;

        const file = fileInput.files[0];
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        
        // User jo input de raha hai (e.g. "1, 3") usse array mein convert karo
        // Indexing 0 se hoti hai isliye -1 kiya hai
        const pagesToRemove = pagesInput.value.split(',')
            .map(p => parseInt(p.trim()) - 1)
            .sort((a, b) => b - a); // Reverse order mein sort karna zaruri hai taaki indexing na bigde

        const totalPages = pdfDoc.getPageCount();

        pagesToRemove.forEach(pageIndex => {
            if (pageIndex >= 0 && pageIndex < totalPages) {
                pdfDoc.removePage(pageIndex);
            }
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `updated_${file.name}`;
        link.click();

        btn.innerHTML = '<i class="fas fa-check me-2"></i>Done!';
        btn.classList.replace('btn-danger', 'btn-success');

    } catch (error) {
        console.error(error);
        alert("Enter valid page number!.");
    } finally {
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-file-pdf me-2"></i>Remove Pages & Download';
            btn.classList.replace('btn-success', 'btn-danger');
            btn.disabled = false;
        }, 3000);
    }
}

// Function to render PDF pages as thumbnails
async function previewPdfPages() {
    const file = document.getElementById('removeInput').files[0];
    const container = document.getElementById('pdfPreviewContainer');
    if (!file) return;

    container.innerHTML = '<div class="text-center w-100"><span class="spinner-border text-primary"></span><p>Generating Previews...</p></div>';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    container.innerHTML = ""; // Clear loader

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 }); // Small scale for thumbnails
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        const wrapper = document.createElement('div');
        wrapper.className = "col-4 col-md-3 position-relative page-wrapper";
        wrapper.id = `page-wrapper-${i}`;
        wrapper.innerHTML = `
            <div class="card p-1 shadow-sm border">
                <img src="${canvas.toDataURL()}" class="img-fluid rounded">
                <div class="text-center small fw-bold mt-1">Page ${i}</div>
                <div class="removal-overlay d-none">
                    <i class="fas fa-times text-danger"></i>
                </div>
            </div>
        `;
        container.appendChild(wrapper);
    }
}

// Function to add the red cross animation in real-time
function markPagesForRemoval() {
    const input = document.getElementById('pageNumbers').value;
    const pagesToRemove = input.split(',').map(p => parseInt(p.trim()));

    // Reset all overlays
    document.querySelectorAll('.removal-overlay').forEach(el => el.classList.add('d-none'));
    document.querySelectorAll('.page-wrapper .card').forEach(el => el.classList.remove('border-danger', 'opacity-50'));

    // Apply red cross to specific pages
    pagesToRemove.forEach(num => {
        const wrapper = document.getElementById(`page-wrapper-${num}`);
        if (wrapper) {
            const overlay = wrapper.querySelector('.removal-overlay');
            const card = wrapper.querySelector('.card');
            overlay.classList.remove('d-none');
            card.classList.add('border-danger', 'opacity-50');
        }
    });
}

// Actual logic to remove pages and download
async function handleRemovePages() {
    const fileInput = document.getElementById('removeInput');
    const pagesInput = document.getElementById('pageNumbers');
    const btn = document.getElementById('removeBtn');

    if (!fileInput.files[0] || !pagesInput.value) {
        alert("Please select a file and enter page numbers!");
        return;
    }

    try {
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
        btn.disabled = true;

        const arrayBuffer = await fileInput.files[0].arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        
        const pagesToRemove = pagesInput.value.split(',')
            .map(p => parseInt(p.trim()) - 1)
            .sort((a, b) => b - a); 

        pagesToRemove.forEach(idx => {
            if (idx >= 0 && idx < pdfDoc.getPageCount()) {
                pdfDoc.removePage(idx);
            }
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `cleaned_${fileInput.files[0].name}`;
        link.click();

        btn.innerHTML = '<i class="fas fa-check me-2"></i>Downloaded!';
        btn.className = "btn btn-success w-100 fw-bold";
    } catch (e) {
        alert("Error: " + e.message);
    } finally {
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-file-pdf me-2"></i>Remove & Download';
            btn.className = "btn btn-danger w-100 fw-bold";
        }, 3000);
    }
}