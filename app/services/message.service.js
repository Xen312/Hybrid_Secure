// app/services/message.service.js

import {
  saveMessage,
  getUserByGoogleId,
  logUserKeys,
  logChatSecret,
  logEncryptedMessage,
  logPlaintextMessage,
  logNetworkTraffic
} from "../db/sheets.db.js";

import {
  generateX25519KeyPair,
  computeSharedSecret,
  deriveAESKeyHKDF,
  encryptAESGCM
} from "./crypto.service.js";

/* ==================================================
   MESSAGE PROCESSING SERVICE
================================================== */

/**
 * Process an outgoing chat message.
 *
 * NOTE:
 * - Encryption is still server-side (temporary).
 * - userKeys is injected to avoid globals.
 */
export async function processMessage({
  msg,
  userKeys
}) {
  const { chat_id, sender_id, text, timestamp } = msg;

  const readableTimestamp = new Date(timestamp).toISOString();

  /* ===== LOG PLAINTEXT (JUDGE VISIBILITY) ===== */
  await logPlaintextMessage({
    chat_id,
    sender: sender_id,
    plaintext: text,
    timestamp: readableTimestamp
  });

  /* ===== CRYPTO ===== */
  const [a, b] = chat_id.split("_");
  const receiver_id = sender_id === a ? b : a;

  // Ensure sender key exists
  async function ensureUserKey(user_id) {
    if (!userKeys.has(user_id)) {
      const user = await getUserByGoogleId(user_id);
      if (!user) return;

      const keypair = generateX25519KeyPair();
      userKeys.set(user_id, keypair);

      await logUserKeys({
        google_id: user_id,
        username: user.username,
        privateKey: keypair.privateKey,
        publicKey: keypair.publicKey
      });
    }
  }

  await ensureUserKey(sender_id);
  await ensureUserKey(receiver_id);

  const senderKey = userKeys.get(sender_id);
  const receiverKey = userKeys.get(receiver_id);

  if (senderKey && receiverKey) {
    const sharedSecret = computeSharedSecret(
      senderKey.privateKey,
      receiverKey.publicKey
    );

    const aesKey = deriveAESKeyHKDF(sharedSecret, chat_id);

    // Log chat secret ONCE per chat
    if (!global.chatSecretsLogged) {
      global.chatSecretsLogged = new Set();
    }

    if (!global.chatSecretsLogged.has(chat_id)) {
      const [user_a, user_b] = chat_id.split("_");

      await logChatSecret({
        chat_id,
        user_a,
        user_b,
        sharedSecret: sharedSecret.toString("base64"),
        aesKey: Buffer.from(aesKey).toString("base64")
      });

      global.chatSecretsLogged.add(chat_id);
    }

    const encrypted = encryptAESGCM(aesKey, text);

    await logEncryptedMessage({
      chat_id,
      sender: sender_id,
      iv: encrypted.iv,
      ciphertext: encrypted.ciphertext,
      authTag: encrypted.authTag,
      timestamp: readableTimestamp
    });

    await logNetworkTraffic({
      direction: "websocket",
      payload: encrypted.ciphertext
    });
  }

  /* ===== SAVE MESSAGE ===== */
  await saveMessage({
    ...msg,
    timestamp: readableTimestamp});
}