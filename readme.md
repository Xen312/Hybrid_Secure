# HybridSecure

HybridSecure is a secure real-time web chat application designed to demonstrate modern authentication, real-time communication, and applied cryptographic principles using a clean, modular architecture.

The project is intended for academic and experimental use, with an emphasis on clarity, explainability, and correctness rather than production-scale deployment.

Features

Google OAuth 2.0 authentication

Real-time messaging using WebSockets

Elliptic Curve Diffie–Hellman key exchange using X25519

Symmetric encryption using AES-256-GCM

Key derivation using HKDF (SHA-256)

Message persistence and audit logging

Modular backend and frontend architecture

Design Goals

HybridSecure is structured to resemble real-world backend systems while remaining easy to understand and explain in an academic context.

Key goals include:

Clear separation of concerns

Minimal logic in the server entry point

Explicit service layers for cryptography and message handling

Modular ES-module-based frontend

##Project Structure

hybrid_secure/  
├── server.js                  # Application entry point  
│
├── app/  
│   ├── app.js                 # Express application setup  
│   │  
│   ├── config/                # Environment and OAuth   configuration
│   │  
│   ├── routes/                # HTTP route definitions  
│   │   ├── auth.routes.js  
│   │   ├── user.routes.js  
│   │   └── message.routes.js  
│   │  
│   ├── services/              # Business logic and   cryptography
│   │   ├── crypto.service.js  
│   │   ├── message.service.js  
│   │   └── user.service.js  
│   │  
│   ├── ws/                    # WebSocket handling  
│   │   └── chat.socket.js  
│   │  
│   └── db/                    # Persistence layer  
│       └── sheets.db.js       # Google Sheets integration  
│  
├── public/  
│   ├── index.html             # Frontend HTML  
│   ├── style.css              # Global styles  
│   └── js/  
│       ├── app.js             # Frontend entry point  
│       ├── auth.js            # Authentication logic  
│       ├── chat.js            # Chat UI logic  
│       └── socket.js          # WebSocket client  
│  
└── README.md

Authentication Flow

User signs in using Google OAuth 2.0

Server verifies the token and sets a session cookie

Client fetches user information via /me

Application loads directly after successful authentication

User identity is derived from the Google account, and no additional username selection is required.

Messaging Architecture

HTTP endpoints are used for loading message history

WebSockets are used exclusively for real-time message delivery

Message processing logic is isolated in a service layer

Transport logic and business logic are strictly separated

Cryptographic Model (Current Implementation)

This implementation performs cryptographic operations on the server for demonstration and audit purposes.

Current Workflow

X25519 key pairs are generated for users

Shared secrets are derived per chat session

AES-256-GCM keys are derived using HKDF

Messages are encrypted before storage and logging

Encrypted messages are transmitted via WebSocket

Important Note

This is not a true end-to-end encrypted system in its current form. The architecture, however, is intentionally designed to support future migration to client-side cryptography.

Technologies Used

Node.js

Express

WebSockets (ws)

Google OAuth 2.0

Google Sheets API

Web Crypto / Node Crypto

ES Modules (Frontend and Backend)

Setup Instructions

Clone the repository

Install dependencies

npm install


Configure environment variables:

Google OAuth Client ID

Google Sheets credentials

Start the server

node server.js


Open the application in the browser

Intended Use

This project is intended for:

Academic demonstrations

Cryptography and security seminars

Architecture and system design learning

Experimental feature development

It is not intended for production use without significant security hardening.

Future Work

Client-side key generation

True end-to-end encryption

Message authenticity verification

Improved session management

Database abstraction layer