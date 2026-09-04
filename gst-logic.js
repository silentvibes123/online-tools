// GST Calculator logic
// calculateGST() and resetGST() are used by the inline template in script.js

function calculateGST(isAdd) {
  const amount = parseFloat(document.getElementById('gstAmount').value);
  const rateEl = document.querySelector('input[name="gstRate"]:checked');
  if (!amount || amount <= 0) return showNotify("error", "Please enter a valid amount!");
  if (!rateEl) return showNotify("error", "Please select a GST rate!");
  const rate = parseFloat(rateEl.value);

  let gst, total, net;
  if (isAdd) {
    gst   = (amount * rate) / 100;
    total = amount + gst;
    net   = amount;
  } else {
    total = amount;
    net   = amount / (1 + rate / 100);
    gst   = total - net;
  }

  document.getElementById('resNet').innerText   = net.toFixed(2);
  document.getElementById('resCGST').innerText  = (gst / 2).toFixed(2);
  document.getElementById('resSGST').innerText  = (gst / 2).toFixed(2);
  document.getElementById('resTotal').innerText = total.toFixed(2);
  document.getElementById('gstResult').classList.remove('d-none');
}

function resetGST() {
  const el = document.getElementById('gstAmount');
  if (el) el.value = '';
  const res = document.getElementById('gstResult');
  if (res) res.classList.add('d-none');
}
