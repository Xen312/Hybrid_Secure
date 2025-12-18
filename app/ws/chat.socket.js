// app/ws/chat.socket.js

import { WebSocketServer } from "ws";
import { processMessage } from "../services/message.service.js";

/* ==================================================
   WEBSOCKET CHAT SERVER
================================================== */

/**
 * Setup WebSocket server for real-time chat.
 *
 * @param {http.Server} server
 * @param {Map} userKeys - in-memory key store (temporary)
 */
export default function setupChatSocket(server, userKeys) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", socket => {
    socket.on("message", async raw => {
      const msg = JSON.parse(raw);

      // Join a chat room
      if (msg.type === "join") {
        socket.chat_id = msg.chat_id;
        socket.user_id = msg.user_id;
        return;
      }

      /* ===== PROCESS MESSAGE ===== */
      await processMessage({
        msg,
        userKeys
      });

      /* ===== BROADCAST MESSAGE ===== */
      wss.clients.forEach(client => {
        if (
          client.readyState === client.OPEN &&
          client.chat_id === socket.chat_id
        ) {
          client.send(JSON.stringify({
            type: "message",
            message: msg
          }));
        }
      });
    });
  });
}
