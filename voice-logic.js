window.pdfPagesText = [];
window.currentSpeech = null;
window.isPaused = false;
window.synth = window.speechSynthesis;

// 1. PDF Processing
window.processVoicePDF = async function(file) {
    if (!file || file.type !== "application/pdf") {
        return Swal.fire("Error", "Only Pdf file required!", "error");
    }
    showNotify("info", "PDF load ho rahi hai...");
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        window.pdfPagesText = [];
        let selectHtml = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items.map(item => item.str).join(" ");
            window.pdfPagesText.push(text);
            selectHtml += `<option value="${i-1}">Page ${i}</option>`;
        }
        document.getElementById("pageSelect").innerHTML = selectHtml;
        document.getElementById("voiceControls").classList.remove("d-none");
        document.getElementById("uploadZone").classList.add("d-none");
        showNotify("success", "PDF Taiyar Hai!");
    } catch (err) {
        showNotify("error", "PDF read nahi ho saki.");
    }
};

// 2. SABSE IMPORTANT: Gujarati Voice Fixer
function setBestVoice(utterance, text) {
    const voices = window.synth.getVoices();
    const isGujarati = /[\u0A80-\u0AFF]/.test(text); // Gujarati script detection

    if (isGujarati) {
        // Pehle Google Gujarati dhoondo (Best quality)
        let gujVoice = voices.find(v => v.lang === 'gu-IN' && v.name.includes('Google'));
        // Agar nahi mili toh koi bhi Gujarati
        if (!gujVoice) gujVoice = voices.find(v => v.lang.includes('gu'));
        // Agar wo bhi nahi toh Hindi (Backup)
        if (!gujVoice) gujVoice = voices.find(v => v.lang.includes('hi'));

        if (gujVoice) {
            utterance.voice = gujVoice;
            utterance.lang = 'gu-IN';
        }
    } else {
        utterance.lang = 'en-US';
    }
}

// 3. Play Function
window.playVoice = function() {
    if (window.isPaused) {
        window.synth.resume();
        window.isPaused = false;
        updateButtonUI('playing');
        return;
    }
    window.stopVoice();
    let pageIdx = parseInt(document.getElementById("pageSelect").value);
    let text = window.pdfPagesText[pageIdx];
    if (!text) return showNotify("error", "Text nahi mila!");

    window.currentSpeech = new SpeechSynthesisUtterance(text);
    window.currentSpeech.rate = parseFloat(document.getElementById("voiceSpeed").value) || 1;
    
    // Voice set karein
    setBestVoice(window.currentSpeech, text);

    window.currentSpeech.onstart = () => updateButtonUI('playing');
    window.currentSpeech.onend = () => {
        updateButtonUI('idle');
        if (document.getElementById("autoNext").checked && pageIdx < window.pdfPagesText.length - 1) {
            document.getElementById("pageSelect").value = pageIdx + 1;
            setTimeout(() => window.playVoice(), 700);
        }
    };
    window.synth.speak(window.currentSpeech);
};

// 4. UI aur baki controls
function updateButtonUI(state) {
    const btn = document.querySelector("button[onclick='playVoice()']");
    if(!btn) return;
    btn.innerHTML = state === 'playing' ? '<i class="fas fa-pause me-1"></i> Speaking...' : '<i class="fas fa-play me-1"></i> Play';
    btn.className = state === 'playing' ? 'btn btn-success w-100 py-3' : 'btn btn-warning w-100 py-3';
}

window.pauseVoice = () => { window.synth.pause(); window.isPaused = true; updateButtonUI('paused'); };
window.stopVoice = () => { window.synth.cancel(); window.isPaused = false; updateButtonUI('idle'); };

window.speakText = function() {
    const text = document.getElementById("speechText").value;
    if (!text.trim()) return;
    window.stopVoice();
    const utt = new SpeechSynthesisUtterance(text);
    setBestVoice(utt, text);
    window.synth.speak(utt);
};

// Voices load hone ka wait karein
window.synth.onvoiceschanged = () => console.log("Voices Loaded!");