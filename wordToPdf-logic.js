// --- Word to PDF Logic ---
window.convertWordToPdf = function(file) {
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.docx')) {
        return showNotify("error", "Only .docx file Considered!");
    }

    const loader = document.getElementById("loaderOverlay");
    if(loader) loader.classList.remove("d-none");

    const reader = new FileReader();
    reader.onload = function(event) {
        const arrayBuffer = event.target.result;
        
        mammoth.convertToHtml({arrayBuffer: arrayBuffer})
            .then(function(result) {
                const html = result.value; 
                const preview = document.getElementById("wordPreview");
                
                // FIXED: ID yahan 'wordToPdfContent' honi chahiye
                preview.innerHTML = `
                    <div id="wordToPdfContent" style="padding:40px; color:#000; background:#fff; font-family: serif; line-height:1.6; width:100%; box-sizing:border-box;">
                        ${html}
                    </div>`;
                
                document.getElementById("previewContainer").classList.remove("d-none");
                document.getElementById("dropZone").classList.add("d-none");
                
                if(loader) loader.classList.add("d-none");
                showNotify("success", "Preview is ready!");
            })
            .catch(function(err) {
                console.error(err);
                if(loader) loader.classList.add("d-none");
                showNotify("error", "Cannot read word file.");
            });
    };
    reader.readAsArrayBuffer(file);
};

window.downloadGeneratedPDF = function() {
    // Ab ye element mil jayega kyunki upar humne yahi ID di hai
    const element = document.getElementById("wordToPdfContent");
    
    if (!element) {
        console.error("Element #wordToPdfContent not found!");
        return showNotify("error", "word file not found!");
    }

    const opt = {
        margin:       [10, 10, 10, 10], 
        filename:     'SwiftTool_Professional.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true,
            letterRendering: true
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    showNotify("info", "PDF Generating...");
    
    html2pdf().set(opt).from(element).save()
    .then(() => {
        showNotify("success", "PDF Downloaded!");
    })
    .catch(err => {
        console.error("PDF Error:", err);
        showNotify("error", "Technical error!");
    });
};