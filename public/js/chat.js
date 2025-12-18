/* ==================================================
   CHAT LOGIC
================================================== */

import { currentUser } from "./auth.js";

/* ---------- DOM ---------- */
const userList = document.getElementById("userList");
const messagesEl = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const backBtn = document.querySelector(".back-btn");

const chatPic = document.getElementById("chatPic");
const chatName = document.getElementById("chatName");

let ws = null;

/* ---------- USERS ---------- */
export async function loadUsers(openChat) {
  const res = await fetch("/users");
  const users = await res.json();

  userList.innerHTML = "";

  users.forEach(user => {
    const div = document.createElement("div");
    div.className = "user-item";

    div.innerHTML = `
      <img src="${user.picture}" class="pfp">
      <span>${user.username}</span>
    `;

    div.onclick = () => {
      openChat(user);
    
      document.querySelector(".app")?.classList.add("show-chat");
    };
    userList.appendChild(div);
  });
}

/* ---------- CHAT ---------- */
function createChatId(a, b) {
  return [a, b].sort().join("_");
}

export async function openChat(user, socket) {
  ws = socket;

  chatName.textContent = user.username;
  chatPic.src = user.picture;
  messagesEl.innerHTML = "";

  const chat_id = createChatId(currentUser.google_id, user.google_id);
  const history = await (await fetch(`/messages?chat_id=${chat_id}`)).json();

  history.forEach(msg =>
    addMessage(msg, msg.sender_id === currentUser.google_id)
  );

  ws.send(JSON.stringify({
    type: "join",
    chat_id,
    user_id: currentUser.google_id
  }));

  ws.chat_id = chat_id;
}

if (backBtn) {
  backBtn.addEventListener("click", () => {
    document.querySelector(".app")?.classList.remove("show-chat");
  });
}

/* ---------- INCOMING MESSAGES ---------- */
export function handleIncomingMessage(data) {
  if (data.type !== "message") return;

  const msg = data.message;
  addMessage(msg, msg.sender_id === currentUser.google_id);
}

function addMessage(msg, mine) {
  const bubble = document.createElement("div");
  bubble.className = mine ? "bubble mine" : "bubble";

  bubble.innerHTML = `
    <div class="bubble-name">${msg.username}</div>
    <div>${msg.text}</div>
  `;

  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

/* ---------- SEND MESSAGE (DEFINE FIRST) ---------- */
function sendMessage() {
  if (!ws || !ws.chat_id) return;

  const text = messageInput.value.trim();
  if (!text) return;

  ws.send(JSON.stringify({
    chat_id: ws.chat_id,
    sender_id: currentUser.google_id,
    username: currentUser.username,
    picture: currentUser.picture,
    text,
    timestamp: Date.now()
  }));

  messageInput.value = "";
}

/* ---------- COMPOSER SETUP ---------- */
export function setupComposer(socket) {
  ws = socket;

  sendBtn.onclick = sendMessage;

  messageInput.onkeydown = e => {
    if (e.key === "Enter") sendMessage();
  };
}
