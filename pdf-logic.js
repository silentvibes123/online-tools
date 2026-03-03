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