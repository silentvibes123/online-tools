// Global Variables
window.pdfPagesText = [];
window.currentSpeech = null;
window.isPaused = false;
window.synth = window.speechSynthesis;

// 1. PDF Processing - File upload handle karne ke liye
window.processVoicePDF = async function(file) {
    if (!file) return;
    
    if (file.type !== "application/pdf") {
        return Swal.fire("Error", "Bhai, sirf PDF file hi chalegi!", "error");
    }

    showNotify("info", "Reading PDF Content...");

    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({data: arrayBuffer});
        const pdf = await loadingTask.promise;
        
        window.pdfPagesText = [];
        let selectHtml = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items.map(item => item.str).join(" ");
            
            window.pdfPagesText.push(text);
            selectHtml += `<option value="${i-1}">Page ${i}</option>`;
        }

        // UI Updates - Controls dikhao aur upload zone chupao
        document.getElementById("pageSelect").innerHTML = selectHtml;
        document.getElementById("voiceControls").classList.remove("d-none");
        document.getElementById("uploadZone").classList.add("d-none");
        document.getElementById("manualText").classList.add("d-none");
        
        showNotify("success", "PDF Loaded Successfully!");
    } catch (err) {
        console.error(err);
        showNotify("error", "PDF read nahi ho payi. Digital PDF use karein.");
    }
};

// 2. Gujarati Voice dhoondhne ka advanced tarika
function getGujaratiVoice() {
    const voices = window.synth.getVoices();
    // Sabse pehle 'gu-IN' dhoondo, phir 'Google Gujarati'
    let guj = voices.find(v => v.lang === 'gu-IN' || v.name.includes('Gujarati'));
    if (!guj) guj = voices.find(v => v.lang.startsWith('gu'));
    if (!guj) guj = voices.find(v => v.lang === 'hi-IN'); // Backup: Hindi accent
    return guj;
}

// 3. UI update karne ke liye (Buttons ke color aur text)
function updateButtonUI(state) {
    const playBtn = document.querySelector("button[onclick='playVoice()']");
    if(!playBtn) return;

    if (state === 'playing') {
        playBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Speaking...';
        playBtn.classList.remove('btn-warning');
        playBtn.classList.add('btn-success');
    } else if (state === 'paused') {
        playBtn.innerHTML = '<i class="fas fa-play me-1"></i> Resume';
        playBtn.classList.remove('btn-success');
        playBtn.classList.add('btn-warning');
    } else {
        playBtn.innerHTML = '<i class="fas fa-play me-1"></i> Play';
        playBtn.classList.add('btn-warning');
        playBtn.classList.remove('btn-success');
    }
}

// 4. Play Function - Yahan hai main Gujarati logic
window.playVoice = function() {
    if (window.isPaused) {
        window.synth.resume();
        window.isPaused = false;
        updateButtonUI('playing');
        return;
    }

    window.stopVoice();
    
    let pageIdx = parseInt(document.getElementById("pageSelect").value);
    let textToSpeak = window.pdfPagesText[pageIdx];

    if (!textToSpeak || textToSpeak.trim().length < 2) {
        return showNotify("error", "Is page par koi text nahi mila!");
    }

    window.currentSpeech = new SpeechSynthesisUtterance(textToSpeak);
    window.currentSpeech.rate = parseFloat(document.getElementById("voiceSpeed").value) || 1;

    // Detection: Agar Gujarati characters hain toh Gujarati voice set karo
    const isGujarati = /[\u0A80-\u0AFF]/.test(textToSpeak);
    
    if (isGujarati) {
        const gVoice = getGujaratiVoice();
        if (gVoice) {
            window.currentSpeech.voice = gVoice;
        }
        window.currentSpeech.lang = 'gu-IN';
    } else {
        window.currentSpeech.lang = 'en-US';
    }

    window.currentSpeech.onstart = () => updateButtonUI('playing');
    
    window.currentSpeech.onend = () => {
        updateButtonUI('idle');
        let autoNext = document.getElementById("autoNext").checked;
        if (autoNext && pageIdx < window.pdfPagesText.length - 1) {
            document.getElementById("pageSelect").value = pageIdx + 1;
            // Chota sa pause taaki agla page smooth start ho
            setTimeout(() => window.playVoice(), 600);
        }
    };

    window.currentSpeech.onerror = (e) => {
        console.error("Speech Error:", e);
        updateButtonUI('idle');
    };

    window.synth.speak(window.currentSpeech);
};

// 5. Pause & Stop
window.pauseVoice = function() {
    window.synth.pause();
    window.isPaused = true;
    updateButtonUI('paused');
};

window.stopVoice = function() {
    window.synth.cancel();
    window.isPaused = false;
    updateButtonUI('idle');
};

// 6. Manual Text Speech
window.speakText = function() {
    const text = document.getElementById("speechText").value;
    if (!text.trim()) return showNotify("error", "Kuch toh likho bhai!");
    
    window.stopVoice();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (/[\u0A80-\u0AFF]/.test(text)) {
        const gVoice = getGujaratiVoice();
        if (gVoice) utterance.voice = gVoice;
        utterance.lang = 'gu-IN';
    } else {
        utterance.lang = 'en-US';
    }
    
    window.synth.speak(utterance);
    showNotify("info", "AI is reading your text...");
};

window.resetVoice = function() {
    window.stopVoice();
    openTool('voice');
};

// Browsers ko voices load karne ke liye push karna padta hai
window.synth.onvoiceschanged = () => {
    console.log("Voices Updated. Gujarati Ready.");
};