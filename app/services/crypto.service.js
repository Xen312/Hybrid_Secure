// app/services/crypto.service.js
import crypto from "crypto";

/* ==================================================
   X25519 KEY EXCHANGE
================================================== */

/**
 * Generate an X25519 key pair.
 * Keys are returned as base64-encoded DER buffers.
 */
export function generateX25519KeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("x25519");

  return {
    publicKey: publicKey
      .export({ type: "spki", format: "der" })
      .toString("base64"),

    privateKey: privateKey
      .export({ type: "pkcs8", format: "der" })
      .toString("base64")
  };
}

/**
 * Compute a shared secret using X25519.
 *
 * @param {string} privateKeyB64 - base64 PKCS8 private key
 * @param {string} publicKeyB64  - base64 SPKI public key
 * @returns {Buffer} shared secret
 */
export function computeSharedSecret(privateKeyB64, publicKeyB64) {
  const privateKey = crypto.createPrivateKey({
    key: Buffer.from(privateKeyB64, "base64"),
    format: "der",
    type: "pkcs8"
  });

  const publicKey = crypto.createPublicKey({
    key: Buffer.from(publicKeyB64, "base64"),
    format: "der",
    type: "spki"
  });

  return crypto.diffieHellman({ privateKey, publicKey });
}

/* ==================================================
   KEY DERIVATION (HKDF)
================================================== */

/**
 * Derive a 256-bit AES key using HKDF-SHA256.
 *
 * @param {Buffer} sharedSecret
 * @param {string} chatId - used as salt
 * @returns {Buffer} 32-byte AES key
 */
export function deriveAESKeyHKDF(sharedSecret, chatId) {
  return crypto.hkdfSync(
    "sha256",
    sharedSecret,
    Buffer.from(chatId),
    Buffer.from("HybridSecure AES-GCM Key"),
    32
  );
}

/* ==================================================
   SYMMETRIC ENCRYPTION (AES-256-GCM)
================================================== */

/**
 * Encrypt plaintext using AES-256-GCM.
 *
 * @param {Buffer} key
 * @param {string} plaintext
 * @returns {{ iv, ciphertext, authTag }}
 */
export function encryptAESGCM(key, plaintext) {
  const iv = crypto.randomBytes(12); // 96-bit nonce (GCM standard)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final()
  ]);

  return {
    iv: iv.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64")
  };
}

/**
 * Decrypt AES-256-GCM ciphertext.
 *
 * @param {Buffer} key
 * @param {string} ivB64
 * @param {string} ciphertextB64
 * @param {string} authTagB64
 * @returns {string} plaintext
 */
export function decryptAESGCM(
  key,
  ivB64,
  ciphertextB64,
  authTagB64
) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivB64, "base64")
  );

  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));

  return (
    decipher.update(ciphertextB64, "base64", "utf8") +
    decipher.final("utf8")
  );
}
