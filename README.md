# 💬 quickChat — Real-Time Chat Application

A blazing fast, full-stack real-time chat application featuring secure user authentication, instant messaging, live status indicators, and sleek profile customization. Built using the MERN stack and fine-tuned for serverless deployment on Vercel.

---

## 🚀 Features

- **Instant Messaging:** Real-time message delivery and receipt powered by Socket.io.
- **Live Status Tracking:** Real-time tracking of online and offline users in the sidebar.
- **Secure Authentication:** Robust signup and login functionality with middleware route protection.
- **Media Support:** Optimized support for base64 media uploads with up to 10MB limits.
- **Modern UI:** Clean, responsive, and gorgeous user interface built with Tailwind CSS.
- **Monorepo Ready:** Production-ready routing structure designed specifically for Vercel.

---

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS
- React Router DOM
- React Hot Toast
- Axios

**Backend:**
- Node.js
- Express.js
- Socket.io
- MongoDB & Mongoose
- Dotenv

---

## 📂 Project Structure

```text
quickChat/
├── backend/
│   ├── controllers/      # Route controllers (auth, messages)
│   ├── lib/              # Database connection configuration
│   ├── middlewares/      # Authentication route protection
│   ├── routes/           # Express router endpoints
│   ├── server.js         # Main server entry point & Socket setups
│   └── vercel.json       # Backend Vercel serverless configurations
└── client/               # Frontend React/Vite application
    ├── src/
    │   ├── assets/       # Global static media and icons
    │   ├── context/      # Global Authentication State
    │   ├── pages/        # Home, Login, and Profile views
    │   └── App.jsx       # Main component wrapper and client routing
    └── vercel.json       # Frontend routing rewrites for SPA
