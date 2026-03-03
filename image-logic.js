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
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

    try {
        const data = await readFileAsDataURL(file);
        const img = new Image();
        img.src = data;
        await new Promise(r => img.onload = r);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // TIP: Resolution double rakho (700x900) taaki quality na gire
        // Browser download ke waqt ise wapas adjust kar lega
        const targetWidth = 350; 
        const targetHeight = 450;
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Image Smoothing enable karein (Bahut zaruri hai!)
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const imgRatio = img.width / img.height;
        const targetRatio = targetWidth / targetHeight;
        let dW, dH, oX, oY;

        if (imgRatio > targetRatio) {
            dH = targetHeight;
            dW = targetHeight * imgRatio;
            oX = -(dW - targetWidth) / 2;
            oY = 0;
        } else {
            dW = targetWidth;
            dH = targetWidth / imgRatio;
            oX = 0;
            oY = -(dH - targetHeight) / 2;
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(img, oX, oY, dW, dH);

        let quality = 0.95;
        let blob;
        let sizeKB = Infinity;

        // Smart Loop: Quality ko bahut slow girao (0.02 step)
        // Taaki target size ke bilkul kareeb pahunche bina quality kharab kiye
        while (sizeKB > targetKB && quality > 0.05) {
            blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
            sizeKB = blob.size / 1024;
            
            if (sizeKB > targetKB + 10) quality -= 0.05; // Door hai toh tez girao
            else quality -= 0.01; // Kareeb hai toh dhire girao
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Exam_Ready_${sizeKB.toFixed(0)}KB.jpg`;
        a.click();

        showNotify("success", `Perfect! Final Size: ${sizeKB.toFixed(1)}KB`);
    } catch (e) {
        showNotify("error", "Resize fail ho gaya!");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function resizeImageWithAspect(img, targetWidth, targetHeight) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Canvas ka size fix rakho jo exam board ne manga hai
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Image ki purani ratio nikalna
    const imgRatio = img.width / img.height;
    const targetRatio = targetWidth / targetHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    // "Object-fit: cover" jaisa logic taaki photo phate nahi
    if (imgRatio > targetRatio) {
        drawHeight = targetHeight;
        drawWidth = targetHeight * imgRatio;
        offsetX = -(drawWidth - targetWidth) / 2;
        offsetY = 0;
    } else {
        drawWidth = targetWidth;
        drawHeight = targetWidth / imgRatio;
        offsetX = 0;
        offsetY = -(drawHeight - targetHeight) / 2;
    }

    // Safed background dena taaki koi hissa khali na dikhe
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Image ko draw karna bina bigade
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    return canvas.toDataURL('image/jpeg', 0.9); // 0.9 quality
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

// Helper to show SweetAlert notifications
function showNotify(icon, title) {
    Swal.fire({
        icon: icon,
        title: title,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
}