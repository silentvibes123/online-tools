async function smartResize() {
  const file = document.getElementById("resizeInput").files[0];
  const targetKB = parseInt(document.getElementById("targetSize").value);
  if (!file) return showNotify("error", "Photo select karein!");

  const btn = document.querySelector("button[onclick='smartResize()']");
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

  await openAd(); // Action se pehle ad

  let quality = 0.9;
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 350;
      canvas.height = 450;
      ctx.drawImage(img, 0, 0, 350, 450);

      function attemptDownload(q) {
        canvas.toBlob((blob) => {
            if (blob.size / 1024 > targetKB && q > 0.1) {
              attemptDownload(q - 0.1);
            } else {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `Exam_Ready_${targetKB}KB.jpg`;
              a.click();
              btn.disabled = false;
              btn.innerHTML = originalText;
              showNotify("success", `Success! Final Size: ${(blob.size / 1024).toFixed(1)}KB`);
            }
          }, "image/jpeg", q);
      }
      attemptDownload(quality);
    };
  };
}

async function compressImage() {
  const file = document.getElementById("compressInput").files[0];
  if (!file) return showNotify("error", "Please select an image!");

  const btn = document.querySelector("button[onclick='compressImage()']");
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Compressing...';

  await openAd(); // Pehle Ad dikhao

  const quality = parseFloat(document.getElementById("qualityRange").value);
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      let width = img.width;
      let height = img.height;
      const MAX_WIDTH = 1200;
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `SwiftTool_Compressed_${file.name}`;
          a.click();
          
          btn.disabled = false;
          btn.innerHTML = originalText;
          showNotify("success", `Compressed to approx ${(blob.size / 1024).toFixed(2)} KB`);
        }, "image/jpeg", quality);
    };
  };
}

function previewResize() {
  const file = document.getElementById("resizeInput").files[0];
  const previewArea = document.getElementById("resPreview");
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewArea.innerHTML = `
        <img src="${e.target.result}" class="img-fluid rounded shadow-sm border" style="max-height:150px">
        <p class="small text-muted mt-2">Original Size: ${(file.size / 1024).toFixed(2)} KB</p>
      `;
    };
    reader.readAsDataURL(file);
  }
}


async function generatePDF() {
  const files = document.getElementById("imageInput").files;
  if (files.length === 0) return showNotify("error", "Please select images first!");

  const btn = document.getElementById("pdfBtn");
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generating PDF...';

  try {
    await openAd(); // Ad trigger

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 0; i < files.length; i++) {
      const data = await readFileAsDataURL(files[i]);
      const img = new Image();
      img.src = data;
      await new Promise((resolve) => (img.onload = resolve));

      if (i > 0) doc.addPage();

      let imgWidth = pageWidth - 20;
      let imgHeight = (img.height * imgWidth) / img.width;

      if (imgHeight > pageHeight - 20) {
        imgHeight = pageHeight - 20;
        imgWidth = (img.width * imgHeight) / img.height;
      }

      const xOffset = (pageWidth - imgWidth) / 2;
      const yOffset = (pageHeight - imgHeight) / 2;
      doc.addImage(data, "JPEG", xOffset, yOffset, imgWidth, imgHeight);
    }

    doc.save("SwiftTool_Converted.pdf");
    showNotify("success", "PDF Downloaded Successfully!");
  } catch (e) {
    showNotify("error", "Failed to generate PDF.");
  }
  btn.disabled = false;
  btn.innerHTML = originalText;
}

function resetCompressor() {
  document.getElementById("compressInput").value = "";
  document.getElementById("previewArea").innerHTML = "Preview";
  showNotify("info", "Cleared");
}