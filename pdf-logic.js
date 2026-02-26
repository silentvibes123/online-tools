// pdf-tools.js ki pehli line
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

// Merge PDF - Sahi hai
async function mergePDFs() {
    const files = document.getElementById("mergeInput").files;
    if (files.length < 2) return showNotify("error", "Kam se kam 2 PDF select karein!");

    const btn = document.getElementById("mergeBtn");
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Processing...`;

    await openAd(); // Sabse pehle Ad

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
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "SwiftTool_Merged.pdf";
        link.click(); // Bina body mein add kiye bhi chalega
        
        showNotify("success", "PDF Merged Successfully!");
    } catch (e) {
        showNotify("error", "Merging failed!");
    }
    btn.disabled = false;
    btn.innerHTML = originalText;
}


async function splitPDF() {
    const file = document.getElementById("splitInput").files[0];
    const start = parseInt(document.getElementById("startPage").value);
    const end = parseInt(document.getElementById("endPage").value);

    if (!file || !start || !end) return showNotify("error", "Details fill karein!");

    const btn = document.getElementById("splitBtn");
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Processing...`;
    
    // Ad Trigger
    await openAd();

    try {
        const { PDFDocument } = window.PDFLib;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const newPdf = await PDFDocument.create();

        const totalPages = pdf.getPageCount();
        if (start < 1 || end > totalPages || start > end) {
            throw new Error(`Invalid range! Total pages: ${totalPages}`);
        }

        const pagesToCopy = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
        const copiedPages = await newPdf.copyPages(pdf, pagesToCopy);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `SwiftTool_Split.pdf`;
        link.click();

        showNotify("success", "PDF Split Successfully!");
    } catch (e) {
        showNotify("error", e.message);
    }
    
    btn.disabled = false;
    btn.innerHTML = originalText;
}

// PDF to Image (Fully Fixed)
let extractedImages = []; // Global variable images store karne ke liye

async function convertPdfToImg() {
  const file = document.getElementById("pdfInput").files[0];
  if (!file) return showNotify("error", "Please select a PDF file!");

  const btn = document.getElementById("pdfImgBtn");
  const downloadAllBtn = document.getElementById("downloadAllBtn");
  const originalText = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Wait...';

  await openAd(); // Ad Trigger pehle

  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Extracting...';
  extractedImages = []; 
  const previewArea = document.getElementById("pdfPreview");
  previewArea.innerHTML = "";

  try {
    // FileReader ko await ke saath use karna zyada stable hai
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = window["pdfjs-dist/build/pdf"] || window.pdfjsLib;
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 }); 
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;

      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      extractedImages.push({ name: `Page_${i}.jpg`, data: imgData });

      previewArea.innerHTML += `
          <div class="col-6 col-md-3 text-center mb-3 animate__animated animate__fadeIn">
              <img src="${imgData}" class="img-fluid border rounded shadow-sm mb-2">
              <a href="${imgData}" download="Page_${i}.jpg" class="btn btn-sm btn-outline-info">Save Page ${i}</a>
          </div>`;
    }

    downloadAllBtn.classList.remove("d-none");
    showNotify("success", `${pdf.numPages} pages extracted!`);
  } catch (e) {
    showNotify("error", "Error processing PDF.");
    console.error(e);
  }
  btn.disabled = false;
  btn.innerHTML = originalText;
}

function resetPdfToImg() {
  document.getElementById("pdfInput").value = "";
  document.getElementById("pdfPreview").innerHTML = "";
  document.getElementById("downloadAllBtn").classList.add("d-none"); // Ye line add karein
  extractedImages = [];
  showNotify("info", "PDF Cleared");
}

function resetPDFTool() {
  document.getElementById("imageInput").value = "";
  showNotify("info", "File Cleared");
}