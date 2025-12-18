/* =======================
   SERVER ENTRY POINT
======================= */

import http from "http";

/* =======================
   CONFIG
======================= */
import { ENV } from "./app/config/env.js";

/* =======================
   APP & SOCKET
======================= */
import createApp from "./app/app.js";
import setupChatSocket from "./app/ws/chat.socket.js";

/* =======================
   IN-MEMORY STORAGE
======================= */
// Temporary (will be removed when crypto moves client-side)
const userKeys = new Map(); // google_id → keypair

/* =======================
   CREATE APP & SERVER
======================= */
const app = createApp({ userKeys });
const server = http.createServer(app);

/* =======================
   WEBSOCKET SETUP
======================= */
setupChatSocket(server, userKeys);

/* =======================
   START SERVER
======================= */
server.listen(ENV.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${ENV.PORT}`);
});
