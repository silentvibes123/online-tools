// ===== WORD TO PDF — Advanced Fix =====
// Strategy: render content in a hidden off-screen A4 div,
// then use html2pdf with correct mm-based settings.
// This eliminates the left-shift / layout bug completely.

window.convertWordToPdf = function(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.docx')) {
        return showNotify("error", "Only .docx files are supported!");
    }

    const loader = document.getElementById("loaderOverlay");
    if (loader) { loader.style.display = "flex"; loader.classList.remove("d-none"); }

    const reader = new FileReader();
    reader.onload = function(e) {
        mammoth.convertToHtml({ arrayBuffer: e.target.result })
            .then(function(result) {
                const preview = document.getElementById("wordPreview");

                preview.innerHTML = `
                <div id="wordToPdfContent"
                     style="width:100%;
                            max-width:794px;
                            margin:0 auto;
                            padding:60px 70px;
                            background:#fff;
                            color:#111;
                            font-family:'Times New Roman',Times,serif;
                            font-size:12pt;
                            line-height:1.8;
                            box-sizing:border-box;">
                    ${result.value}
                </div>`;

                // Inject scoped styles
                let style = document.getElementById("wordPdfStyles");
                if (!style) {
                    style = document.createElement("style");
                    style.id = "wordPdfStyles";
                    document.head.appendChild(style);
                }
                style.textContent = `
                    #wordToPdfContent p   { margin:0 0 8px 0; }
                    #wordToPdfContent h1  { font-size:20pt; font-weight:700; margin:14px 0 6px; }
                    #wordToPdfContent h2  { font-size:16pt; font-weight:700; margin:12px 0 5px; }
                    #wordToPdfContent h3  { font-size:13pt; font-weight:700; margin:10px 0 4px; }
                    #wordToPdfContent ul,
                    #wordToPdfContent ol  { padding-left:28px; margin:6px 0 10px; }
                    #wordToPdfContent li  { margin-bottom:4px; }
                    #wordToPdfContent table { width:100%; border-collapse:collapse; margin:10px 0; }
                    #wordToPdfContent td,
                    #wordToPdfContent th  { border:1px solid #aaa; padding:5px 8px; font-size:11pt; }
                    #wordToPdfContent strong { font-weight:700; }
                    #wordToPdfContent em    { font-style:italic; }
                    #wordToPdfContent a     { color:#1a0dab; }
                    #wordToPdfContent img   { max-width:100%; height:auto; display:block; }
                `;

                document.getElementById("previewContainer").classList.remove("d-none");
                document.getElementById("dropZone").classList.add("d-none");
                if (loader) { loader.style.display = "none"; loader.classList.add("d-none"); }
                showNotify("success", "Preview ready! Click Download to get PDF.");
            })
            .catch(function(err) {
                console.error(err);
                if (loader) { loader.style.display = "none"; loader.classList.add("d-none"); }
                showNotify("error", "Cannot read this Word file.");
            });
    };
    reader.readAsArrayBuffer(file);
};

window.downloadGeneratedPDF = function() {
    const element = document.getElementById("wordToPdfContent");
    if (!element) return showNotify("error", "Please upload a Word file first.");

    const btn = document.getElementById("downloadPdfBtn");
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating PDF...';
    }

    // Clone element into a hidden full-width container so html2canvas
    // renders it at exactly 794px (A4 pixel width at 96dpi) — no layout shift
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
        position:fixed; top:0; left:0; z-index:-9999;
        width:794px; background:#fff; padding:0; margin:0;
        pointer-events:none; opacity:0;
    `;
    const clone = element.cloneNode(true);
    clone.style.cssText = `
        width:794px; padding:60px 70px; background:#fff;
        color:#111; font-family:'Times New Roman',Times,serif;
        font-size:12pt; line-height:1.8; box-sizing:border-box;
        margin:0; text-align:left;
    `;
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    const opt = {
        margin:      [10, 10, 10, 10],   // mm: top, left, bottom, right
        filename:    'onlineTools_Document.pdf',
        image:       { type: 'jpeg', quality: 0.97 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 794,
            windowWidth: 794,
            logging: false
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf()
        .set(opt)
        .from(wrapper)
        .save()
        .then(function() {
            showNotify("success", "PDF Downloaded!");
        })
        .catch(function(err) {
            console.error(err);
            showNotify("error", "PDF generation failed. Try again.");
        })
        .finally(function() {
            document.body.removeChild(wrapper);
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-file-pdf me-2"></i>Download as PDF';
            }
        });
};
