# 📚 Online Learning Platform

The **Online Learning Platform** is a web-based application that enables teachers and students to collaborate in a digital environment.  
It provides features like **MCQ test creation & participation, notes sharing, notice board announcements, and a blog system** for interaction.  

This project is developed with **ReactJS (frontend)**, **Node.js + Express (backend)**, and **PostgreSQL (database)**.  

---

## 🚀 Features
- 👤 **User Management** (registration, login, role-based access: teacher/student)  
- 📝 **Test Management** (MCQ tests, unique links, auto evaluation, result analysis)  
- 📂 **Notes & File Sharing** (upload by teachers, download by students)  
- 📢 **Notice Board** (important announcements from teachers)  
- 📰 **Blog System** (teachers & students can write, comment, and interact)  

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
git clone https://github.com/Tonmoy-Roy-CSE-CU/OnlineLearningPlatform/tree/master.git
cd OnlineLearningPlatform

### 2️⃣ Install PostgreSQL
Download & install from: [PostgreSQL Download](https://www.postgresql.org/download/windows/)
* User: `postgres`
* Password: `yourpassword` (must match `.env`)

### 3️⃣ Setup Database
Create the database:
```bash
createdb -U postgres olpm
```

Import schema & data (if you have `olpm.sql`):
```bash
psql -U postgres -d olpm -f backend/olpm.sql
```

---

## 🧪 Backend Setup
```bash
cd backend
npm install
```

Create `.env` inside `backend/`:
```env
PORT=5000

DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=olpm

JWT_SECRET=your_jwt_secret
```

Run backend:
```bash
node server.js
```

---

## 🎨 Frontend Setup
```bash
cd ../frontend1
npm install
```

Create `.env` inside `frontend1/`:
```env
VITE_API_BASE=http://localhost:5000/api
```

Run frontend:
```bash
npm run dev
```

Open in browser:
👉 [http://localhost:3000](http://localhost:3000)

---

## 📦 Dependencies & Requirements

| Tool       | Required Version | Notes                  |
| ---------- | ---------------- | ---------------------- |
| Node.js    | v18+             | For frontend & backend |
| PostgreSQL | v13+             | Database               |
| Git        | Any              | Version control        |
| pgAdmin    | Optional         | DB management          |

---

## ▶️ Running Locally

1. Start PostgreSQL and ensure `olpm` DB is imported.
2. Start backend:
   ```bash
   cd backend
   node server.js
   ```
3. Start frontend:
   ```bash
   cd frontend1
   npm run dev
   ```
4. Visit [http://localhost:3000](http://localhost:3000).

---

## 👤 Sample Credentials (Demo)

| Role    | Email                                             | Password |
| ------- | ------------------------------------------------- | -------- |
| Admin   | [admin@example.com](mailto:admin@example.com)     | 123456   |
| Teacher | [teacher@example.com](mailto:teacher@example.com) | 123456   |
| Student | [student@example.com](mailto:student@example.com) | 123456   |

(If these are not in the DB yet, they can register.)



