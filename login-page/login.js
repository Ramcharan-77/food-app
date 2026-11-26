let generatedOTP = "";
let pendingUser = null;

function sendTwoFactorCode() {
  const name = document.getElementById("login-name").value.trim();
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-pass").value.trim();

  if (!name || !email || !pass) {
    showToast("Please fill in all login fields", "danger");
    return;
  }

  generatedOTP = String(Math.floor(100000 + Math.random() * 900000));
  pendingUser = {
    name,
    email,
    phone: "+91 98765 43210",
    wallet: 500,
    twoFactorEnabled: true,
    addresses: [{ id: 1, label: "Home", text: "Plot 42, Madhapur, Hyderabad, Telangana" }]
  };

  document.getElementById("step-credentials").style.display = "none";
  document.getElementById("step-2fa").style.display = "flex";
  document.getElementById("otp-hint").innerHTML =
    `Demo 2FA Code for <strong>${email}</strong>: <span style="color: var(--primary); font-weight: 800; font-size: 1.1rem;">${generatedOTP}</span>`;
  showToast(`2FA OTP generated: ${generatedOTP}`);
}

function verifyTwoFactorCode() {
  const entered = document.getElementById("otp-input").value.trim();
  if (entered !== generatedOTP) {
    showToast("Invalid 2FA code! Please check and retry.", "danger");
    return;
  }

  const existing = getCurrentUser();
  saveCurrentUser(
    existing ? { ...existing, name: pendingUser.name, email: pendingUser.email } : pendingUser
  );

  showToast("2FA Verified! Redirecting to Profile...");
  setTimeout(() => {
    window.location.href = "../profile-page/index.html";
  }, 700);
}

function resetLogin() {
  document.getElementById("step-2fa").style.display = "none";
  document.getElementById("step-credentials").style.display = "flex";
}
