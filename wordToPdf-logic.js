// --- Word to PDF Logic ---
window.convertWordToPdf = function(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.docx')) {
        return showNotify("error", "Only .docx files are supported!");
    }

    const loader = document.getElementById("loaderOverlay");
    if (loader) loader.classList.remove("d-none");

    const reader = new FileReader();
    reader.onload = function(event) {
        mammoth.convertToHtml({ arrayBuffer: event.target.result })
            .then(function(result) {
                const preview = document.getElementById("wordPreview");

                // A4 width = 210mm. At 96dpi: 794px. Margins ~20mm each side = 150px each.
                // We render at exact A4 proportions so html2pdf captures it correctly.
                preview.innerHTML = `
                    <div id="wordToPdfContent" style="
                        width: 794px;
                        min-height: 1123px;
                        margin: 0 auto;
                        padding: 72px 80px;
                        background: #fff;
                        color: #000;
                        font-family: 'Times New Roman', Times, serif;
                        font-size: 13pt;
                        line-height: 1.7;
                        box-sizing: border-box;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    ">
                        <style>
                            #wordToPdfContent p { margin: 0 0 10px 0; }
                            #wordToPdfContent h1 { font-size: 22pt; font-weight: bold; margin: 16px 0 8px; }
                            #wordToPdfContent h2 { font-size: 18pt; font-weight: bold; margin: 14px 0 6px; }
                            #wordToPdfContent h3 { font-size: 15pt; font-weight: bold; margin: 12px 0 5px; }
                            #wordToPdfContent ul, #wordToPdfContent ol { padding-left: 24px; margin: 8px 0; }
                            #wordToPdfContent li { margin-bottom: 4px; }
                            #wordToPdfContent table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                            #wordToPdfContent td, #wordToPdfContent th { border: 1px solid #999; padding: 6px 10px; }
                            #wordToPdfContent strong { font-weight: bold; }
                            #wordToPdfContent em { font-style: italic; }
                        </style>
                        ${result.value}
                    </div>`;

                document.getElementById("previewContainer").classList.remove("d-none");
                document.getElementById("dropZone").classList.add("d-none");
                if (loader) loader.classList.add("d-none");
                showNotify("success", "Preview ready! Click Download to get PDF.");
            })
            .catch(function(err) {
                console.error(err);
                if (loader) loader.classList.add("d-none");
                showNotify("error", "Cannot read this Word file.");
            });
    };
    reader.readAsArrayBuffer(file);
};

window.downloadGeneratedPDF = function() {
    const element = document.getElementById("wordToPdfContent");
    if (!element) return showNotify("error", "No document loaded. Please upload a file first.");

    const opt = {
        margin:      0,
        filename:    'SwiftToolPro_Document.pdf',
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            windowWidth: 794
        },
        jsPDF:       { unit: 'px', format: [794, 1123], orientation: 'portrait' },
        pagebreak:   { mode: ['css', 'legacy'] }
    };

    const btn = document.getElementById("downloadPdfBtn");
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating PDF...'; }

    html2pdf().set(opt).from(element).save()
        .then(() => {
            showNotify("success", "PDF Downloaded!");
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-file-pdf me-2"></i>Download as PDF'; }
        })
        .catch(err => {
            console.error(err);
            showNotify("error", "PDF generation failed. Try again.");
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-file-pdf me-2"></i>Download as PDF'; }
        });
};
