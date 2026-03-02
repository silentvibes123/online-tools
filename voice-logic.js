// --- AI VOICE LOGIC START ---

// 1. PDF Processing logic
window.processVoicePDF = async function(file) {
    if (!file) return;
    showNotify("info", "PDF load ho rahi hai...");
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        window.pdfPagesText = [];
        let options = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items.map(item => item.str).join(" ");
            window.pdfPagesText.push(text);
            options += `<option value="${i-1}">Page ${i}</option>`;
        }

        // UI Update: Manual hide karo aur PDF controls dikhao
        document.getElementById("pageSelect").innerHTML = options;
        document.getElementById("pageSelectCol").classList.remove("d-none");
        document.getElementById("uploadZone").classList.add("d-none");
        document.getElementById("manualText").classList.add("d-none");
        document.getElementById("autoNextDiv").classList.remove("d-none");
        
        showNotify("success", "PDF taiyar hai!");
    } catch (err) {
        console.error(err);
        showNotify("error", "Digital PDF hi upload karein.");
    }
};

// 2. Play / Resume Logic
window.playVoice = function() {
    const synth = window.speechSynthesis;

    // A. Resume logic
    if (synth.paused && window.isPaused) {
        synth.resume();
        window.isPaused = false;
        updateVoiceUI('playing');
        return;
    }

    // B. Naya Start (Stop purana)
    window.stopVoice();

    let text = "";
    const manualTxt = document.getElementById("speechText").value;
    const pageIdx = document.getElementById("pageSelect").value;

    // Check: PDF data hai ya Manual text
    if (window.pdfPagesText.length > 0) {
        text = window.pdfPagesText[pageIdx];
    } else {
        text = manualTxt;
    }

    if (!text || !text.trim()) {
        return showNotify("error", "Pehle text likho ya PDF upload karo!");
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = parseFloat(document.getElementById("voiceSpeed").value) || 1;
    
    // Language logic (Auto-detect)
    const isGujarati = /[\u0A80-\u0AFF]/.test(text);
    const voices = synth.getVoices();
    if (isGujarati) {
        utterance.voice = voices.find(v => v.lang.includes('gu')) || voices[0];
    }

    utterance.onstart = () => {
        window.isPaused = false;
        updateVoiceUI('playing');
    };

    utterance.onend = () => {
        if (!window.isPaused) {
            updateVoiceUI('idle');
            // Auto Next logic
            const autoNext = document.getElementById("autoNext");
            if (autoNext && autoNext.checked && window.pdfPagesText.length > 0) {
                let next = parseInt(document.getElementById("pageSelect").value) + 1;
                if (next < window.pdfPagesText.length) {
                    document.getElementById("pageSelect").value = next;
                    setTimeout(() => window.playVoice(), 700);
                }
            }
        }
    };

    synth.speak(utterance);
};

// 3. Pause Logic
window.pauseVoice = function() {
    const synth = window.speechSynthesis;
    if (synth.speaking && !synth.paused) {
        synth.pause();
        window.isPaused = true;
        updateVoiceUI('paused');
    }
};

// 4. Stop Logic
window.stopVoice = function() {
    window.speechSynthesis.cancel();
    window.isPaused = false;
    updateVoiceUI('idle');
};

// 5. Reset Tool
window.resetVoice = function() {
    window.stopVoice();
    window.pdfPagesText = [];
    
    document.getElementById("uploadZone").classList.remove("d-none");
    document.getElementById("manualText").classList.remove("d-none");
    document.getElementById("pageSelectCol").classList.add("d-none");
    document.getElementById("autoNextDiv").classList.add("d-none");
    document.getElementById("speechText").value = "";
    document.getElementById("pdfInputVoice").value = "";
    
    showNotify("info", "Reset complete!");
};

// 6. UI Update Helper
function updateVoiceUI(state) {
    const btn = document.getElementById("mainPlayBtn");
    if (!btn) return;
    if (state === 'playing') {
        btn.innerHTML = '<i class="fas fa-pause me-1"></i> Pause';
    } else if (state === 'paused') {
        btn.innerHTML = '<i class="fas fa-play me-1"></i> Resume';
    } else {
        btn.innerHTML = '<i class="fas fa-play me-1"></i> Play';
    }
}
// --- AI VOICE LOGIC END ---