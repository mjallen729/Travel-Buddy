# 🌍 Travel Buddy Frontend

This is the frontend for the **Travel Buddy** web application. Built using **vanilla HTML, CSS, and JavaScript**, this UI lets users explore AI-powered travel planning, trip management, and personalized suggestions.

---

## 🚀 Getting Started (Local Setup)

You can view this frontend locally using any static file server.

### ✅ Option 1: Use Live Server

1. Install `live-server` globally (if you don’t have it):
   ```bash
   npm install -g live-server
   ```

2. Run the server:
   ```bash
   npm start
   ```

   This will open `index.html` in your browser at `http://127.0.0.1:8080` (or similar).

---

## 🌿 Tech Stack

- **HTML5**
- **CSS3** – with a travel-themed brand palette
- **Vanilla JavaScript**
- **Font Awesome** – for icons
- **Google Fonts** – Playfair Display & Lora

---

## 📡 Backend Connection

The frontend connects to the backend via API at:
```
http://localhost:5000/api/
```

Make sure the backend is running separately for full functionality.

---

## 👥 Branching & Collaboration Workflow

We use a structured branching strategy to keep our work organized.

### 🧾 Branch Naming Convention

Always branch from `develop` using this format:

```
users/<first-initial><lastname>/<short-feature-name>
```

**Examples:**
- `users/ewynman/homepage-auth`
- `users/mladas/navbar-component`

### 🛠 Merging Rules

- All feature branches must be merged into `develop` via **Pull Requests**
- **Never merge directly into `main`**
- PRs must be **reviewed and approved** before merge

---

## 📦 Environment

No build tools or bundlers required.

Just open `index.html` with Live Server or a browser, and you’re ready to go.
