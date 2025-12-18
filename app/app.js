// app/app.js

import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

/* =======================
   ROUTES
======================= */
import createAuthRoutes from "./routes/auth.routes.js";
import createUserRoutes from "./routes/user.routes.js";
import createMessageRoutes from "./routes/message.routes.js";

/* =======================
   PATH FIX
======================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ==================================================
   EXPRESS APP FACTORY
================================================== */

export default function createApp({ userKeys }) {
   const app = express();

   // -----------------------
   // Content Security Policy
   // -----------------------
   app.use((req, res, next) => {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
      res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
      next();
   });

   /* ---------- MIDDLEWARE ---------- */
   app.use(express.json());
   app.use(cookieParser());

   /* ---------- STATIC FILES ---------- */
   app.use(express.static(path.join(__dirname, "../public")));

   /* ---------- ROUTES ---------- */
   app.use(createAuthRoutes({ userKeys }));
   app.use(createUserRoutes());
   app.use(createMessageRoutes());

   return app;
}
