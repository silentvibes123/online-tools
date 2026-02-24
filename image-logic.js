async function smartResize() {
  const file = document.getElementById("resizeInput").files[0];
  const targetKB = parseInt(document.getElementById("targetSize").value);
  if (!file) return showNotify("error", "Photo select karein!");

  await openAd();

  let quality = 0.9;
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Govt Exam standard size
      canvas.width = 350;
      canvas.height = 450;
      ctx.drawImage(img, 0, 0, 350, 450);

      function attemptDownload(q) {
        canvas.toBlob(
          (blob) => {
            if (blob.size / 1024 > targetKB && q > 0.1) {
              attemptDownload(q - 0.1); // Quality ghatate raho jab tak target na mile
            } else {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `Exam_Ready_${targetKB}KB.jpg`;
              a.click();
              showNotify(
                "success",
                `Success! Final Size: ${(blob.size / 1024).toFixed(1)}KB`,
              );
            }
          },
          "image/jpeg",
          q,
        );
      }
      attemptDownload(quality);
    };
  };
}

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

      // --- SMART RESIZE LOGIC ---
      // Agar image 1200px se badi hai, toh use 1200px tak le aao (Resolution balance)
      let width = img.width;
      let height = img.height;
      const MAX_WIDTH = 1200;

      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;

      // Image draw karo naye dimensions ke sath
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          // Final check: Agar file abhi bhi badi hai, toh automatic download trigger
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `SwiftTool_${quality * 100}kb_${file.name}`;

          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          // Example for Compressor Result in script.js
          // Is line ko download logic ke pass daalein
          const previewArea = document.getElementById("previewArea");

          setTimeout(() => {
            openAd();
            showNotify(
              "success",
              `Compressed to approx ${(blob.size / 1024).toFixed(2)} KB`,
            );
          }, 800);
        },
        "image/jpeg",
        quality, // User ka quality slider
      );
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
  if (files.length === 0)
    return showNotify("error", "Please select images first!");

  const btn = document.getElementById("pdfBtn");
  btn.disabled = true;
  btn.innerHTML = "Processing...";

  try {
    const { jsPDF } = window.jspdf;
    // 'p' (portrait), 'mm' (millimeters), 'a4' (standard size)
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    await openAd();

    for (let i = 0; i < files.length; i++) {
      const data = await readFileAsDataURL(files[i]);

      // Image ki original dimensions nikalne ke liye
      const img = new Image();
      img.src = data;
      await new Promise((resolve) => (img.onload = resolve));

      if (i > 0) doc.addPage();

      // --- Calculation for Original Aspect Ratio ---
      let imgWidth = pageWidth - 20; // 10mm margin dono side se
      let imgHeight = (img.height * imgWidth) / img.width;

      // Agar height page se bahar ja rahi ho toh use adjust karein
      if (imgHeight > pageHeight - 20) {
        imgHeight = pageHeight - 20;
        imgWidth = (img.width * imgHeight) / img.height;
      }

      // Image ko center mein set karna
      const xOffset = (pageWidth - imgWidth) / 2;
      const yOffset = (pageHeight - imgHeight) / 2;

      doc.addImage(data, "JPEG", xOffset, yOffset, imgWidth, imgHeight);
    }

    doc.save("SwiftTool_Converted.pdf");
    showNotify("success", "PDF Downloaded Successfully!");
  } catch (e) {
    console.error(e);
    showNotify("error", "Failed to generate PDF.");
  }
  btn.disabled = false;
  btn.innerHTML = "Generate PDF";
}

function resetCompressor() {
  document.getElementById("compressInput").value = "";
  document.getElementById("previewArea").innerHTML = "Preview";
  showNotify("info", "Cleared");
}