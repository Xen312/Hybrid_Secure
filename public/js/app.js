import { checkAuth } from "./auth.js";
import { createSocket } from "./socket.js";
import {
  loadUsers,
  openChat,
  handleIncomingMessage,
  setupComposer
} from "./chat.js";

let ws = null;

document.addEventListener("DOMContentLoaded", () => {
  checkAuth(async () => {
    ws = createSocket(handleIncomingMessage);
    await loadUsers(user => openChat(user, ws));
    setupComposer(ws); // 👈 THIS LINE FIXES TYPING
  });
});
