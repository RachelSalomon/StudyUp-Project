# StudyUp - Student Task & Course Manager

StudyUp is a smart, full-stack academic social platform tailored specifically for students to organize their academic life, track assignments, and collaborate dynamically. Built using the **MERN** stack and following strict **MVC architecture** patterns.

---

## 🚀 Core Features

- **Personalized Dashboard:** A complete overview of academic metrics, total tasks, and overall progress rate.
- **Advanced Analytics (D3.js):** Highly interactive and responsive charts visualizing task volume by course and priority distribution.
- **Real-Time Collaboration (Chat):** Direct WebSocket communication allowing students to discuss topics instantly.
- **Interactive SketchPad (Canvas):** An integrated drawing area for quick sketches and visualization.
- **jQuery & AJAX Integration:** Asynchronous data fetching built completely with jQuery sub-libraries for dynamic DOM updates.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS / Custom Inline Styles, D3.js (v7), jQuery.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (via Mongoose ODM).
- **Authentication:** JSON Web Tokens (JWT) & bcrypt password hashing.

---

## 📂 Project Structure

```text
STUDYUP-PROJECT/
├── client/                 # React Frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI blocks (Navbar, ProtectedRoute)
│   │   ├── context/        # Auth state management
│   │   └── pages/          # Layout views (Analytics, Chat, SketchPad, JQuery)
├── server/                 # Node.js / Express Backend API
│   ├── controllers/        # Business logic handlers (MVC)
│   ├── middleware/         # Auth & Authorization route guards
│   ├── models/             # Database schemas (User, Task, Course)
│   ├── routes/             # REST API Endpoints mapping
│   └── server.js           # Application entry point
└── .gitignore              # Root security filter configuration
