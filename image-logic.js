// Helper: File to DataURL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 1. Smart Resize (Exam Ready - 350x450)
async function smartResize() {
    const file = document.getElementById("resizeInput").files[0];
    const targetKB = parseInt(document.getElementById("targetSize").value);
    if (!file) return showNotify("error", "Photo select karein!");

    const btn = document.querySelector("button[onclick='smartResize()']");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Resizing...';

    try {
        const data = await readFileAsDataURL(file);
        const img = new Image();
        img.src = data;
        await new Promise(r => img.onload = r);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        // Standard Exam Size
        canvas.width = 350;
        canvas.height = 450;
        ctx.drawImage(img, 0, 0, 350, 450);

        let quality = 0.95;
        let blob;
        let sizeKB = Infinity;

        // Smart Loop: Jab tak size target se bada hai, quality kam karo
        while (sizeKB > targetKB && quality > 0.1) {
            blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
            sizeKB = blob.size / 1024;
            quality -= 0.08; // 8% quality drop per step
        }

        // --- YAHAN APNI AD DIKHAO (IF ANY) ---
        // if(window.showAd) await window.showAd();

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Exam_Ready_${targetKB}KB.jpg`;
        a.click();

        showNotify("success", `Perfect! Final Size: ${sizeKB.toFixed(1)}KB`);
    } catch (e) {
        showNotify("error", "Resize fail ho gaya!");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// 2. Image Compressor (High Quality)
async function compressImage() {
    const file = document.getElementById("compressInput").files[0];
    if (!file) return showNotify("error", "Please select an image!");

    const btn = document.querySelector("button[onclick='compressImage()']");
    const originalText = btn.innerHTML;
    const quality = parseFloat(document.getElementById("qualityRange").value);

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Compressing...';

    try {
        const data = await readFileAsDataURL(file);
        const img = new Image();
        img.src = data;
        await new Promise(r => img.onload = r);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Max 1200px width limit to keep it web-friendly
        let width = img.width;
        let height = img.height;
        if (width > 1200) {
            height *= 1200 / width;
            width = 1200;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg", quality));
        
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `SwiftTool_Compressed_${file.name}`;
        a.click();

        showNotify("success", `Done! Size: ${(blob.size / 1024).toFixed(1)}KB`);
    } catch (e) {
        showNotify("error", "Compression failed!");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// 3. Images to PDF (A4 Optimization)
async function generatePDF() {
    const files = document.getElementById("imageInput").files;
    if (files.length === 0) return showNotify("error", "Please select images!");

    const btn = document.getElementById("pdfBtn");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner-border spinner-border-sm"></div> Processing...';

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("p", "mm", "a4");
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        for (let i = 0; i < files.length; i++) {
            const data = await readFileAsDataURL(files[i]);
            const img = new Image();
            img.src = data;
            await new Promise(r => img.onload = r);

            if (i > 0) doc.addPage();
            
            // Image scaling logic (Maintain Aspect Ratio)
            let ratio = Math.min((pageWidth - 20) / img.width, (pageHeight - 20) / img.height);
            let w = img.width * ratio;
            let h = img.height * ratio;
            
            let x = (pageWidth - w) / 2;
            let y = (pageHeight - h) / 2;

            doc.addImage(data, "JPEG", x, y, w, h);
        }

        doc.save("SwiftTool_Images.pdf");
        showNotify("success", "PDF Generated!");
    } catch (e) {
        showNotify("error", "PDF Error!");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}