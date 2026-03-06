
// gst-logic.js file ke andar
function renderGSTUI() {
    return `
        <div class="animate__animated animate__fadeIn">
            <div class="d-flex align-items-center mb-4">
                <button class="btn btn-outline-primary btn-sm me-3" onclick="showDashboard()">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h4 class="mb-0 fw-bold text-primary">GST Calculator (India)</h4>
            </div>

            <div class="card border-0 bg-light p-3 mb-4">
                <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label fw-bold">Amount (₹)</label>
                        <input type="number" id="gstAmount" class="form-control form-control-lg" placeholder="Enter Amount">
                    </div>
                    <div class="col-12 text-center">
                        <label class="form-label d-block fw-bold">Select GST Rate</label>
                        <div class="btn-group w-100" role="group">
                            <input type="radio" class="btn-check" name="gstRate" id="r5" value="5">
                            <label class="btn btn-outline-primary" for="r5">5%</label>
                            
                            <input type="radio" class="btn-check" name="gstRate" id="r12" value="12">
                            <label class="btn btn-outline-primary" for="r12">12%</label>
                            
                            <input type="radio" class="btn-check" name="gstRate" id="r18" value="18" checked>
                            <label class="btn btn-outline-primary" for="r18">18%</label>
                            
                            <input type="radio" class="btn-check" name="gstRate" id="r28" value="28">
                            <label class="btn btn-outline-primary" for="r28">28%</label>
                        </div>
                    </div>
                    <div class="col-6">
                        <button onclick="calculateGST(true)" class="btn btn-primary w-100 py-3">Add GST</button>
                    </div>
                    <div class="col-6">
                        <button onclick="calculateGST(false)" class="btn btn-dark w-100 py-3">Remove GST</button>
                    </div>
                </div>
            </div>

            <div id="gstResult" class="d-none animate__animated animate__fadeIn">
                <div class="card border-primary p-3 shadow-sm">
                    <div class="d-flex justify-content-between mb-2"><span>Net Amount:</span><span class="fw-bold">₹<span id="resNet">0</span></span></div>
                    <div class="d-flex justify-content-between mb-2"><span>CGST (9%):</span><span class="text-muted">₹<span id="resCGST">0</span></span></div>
                    <div class="d-flex justify-content-between mb-2"><span>SGST (9%):</span><span class="text-muted">₹<span id="resSGST">0</span></span></div>
                    <hr>
                    <div class="d-flex justify-content-between"><span class="h5 fw-bold">Total Amount:</span><span class="h5 fw-bold text-primary">₹<span id="resTotal">0</span></span></div>
                </div>
            </div>
        </div>`;
}

// Logic Function (Isi file mein rahega)
function calculateGST(isAdd) {
    const amount = parseFloat(document.getElementById('gstAmount').value);
    const rate = parseFloat(document.querySelector('input[name="gstRate"]:checked').value);
    
    if (!amount || amount <= 0) {
        Swal.fire('Error', 'Please enter a valid amount', 'error');
        return;
    }

    let gst, total, net;
    if (isAdd) {
        gst = (amount * rate) / 100;
        total = amount + gst;
        net = amount;
    } else {
        total = amount;
        net = amount / (1 + (rate / 100));
        gst = total - net;
    }

    document.getElementById('resNet').innerText = net.toFixed(2);
    document.getElementById('resCGST').innerText = (gst / 2).toFixed(2);
    document.getElementById('resSGST').innerText = (gst / 2).toFixed(2);
    document.getElementById('resTotal').innerText = total.toFixed(2);
    document.getElementById('gstResult').classList.remove('d-none');
}

function resetGST() {
    document.getElementById('gstAmount').value = '';
    document.getElementById('gstResult').classList.add('d-none');
}