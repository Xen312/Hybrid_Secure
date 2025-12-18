/* ==================================================
   AUTH & SESSION LOGIC
================================================== */

export let currentUser = null;

/* ---------- SCREENS ---------- */
const loginScreen = document.getElementById("login-screen");
const appScreen = document.getElementById("app");

const logoutBtn = document.getElementById("logoutBtn");
const myPic = document.getElementById("myPic");
const myName = document.getElementById("myName");

/* ---------- UI HELPERS ---------- */
function showLogin() {
  loginScreen.classList.remove("hidden");
  appScreen.classList.add("hidden");
}

function showApp() {
  loginScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
}

/* ---------- AUTH CHECK ---------- */
export async function checkAuth(onReady) {
  try {
    const res = await fetch("/me");
    const data = await res.json();

    if (!data) {
      showLogin();
      return;
    }

    currentUser = data;

    myName.textContent = currentUser.username;
    myPic.src = currentUser.picture;

    showApp();
    onReady();

  } catch {
    showLogin();
  }
}

/* ---------- GOOGLE LOGIN CALLBACK ---------- */
window.handleGoogleLogin = async function (response) {
  const res = await fetch("/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential: response.credential })
  });

  const data = await res.json();
  if (data.success) location.reload();
};

/* ---------- LOGOUT ---------- */
logoutBtn.onclick = () => {
  location.href = "/logout";
};
