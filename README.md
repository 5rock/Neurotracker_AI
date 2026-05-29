# NeuroTrack AI - Learning & Career Intelligence System 🧠🚀

NeuroTrack AI is a premium, futuristic SaaS platform built on the MERN stack. It leverages AI and advanced learning algorithms to help students track memory retention, analyze weak topics, predict skill gaps, and generate personalized career roadmaps.

## 🌟 Key Features

- **🧠 Memory Tracker**: Utilizes the SM-2 spaced repetition algorithm to optimize revision schedules and track memory retention over time.
- **🔥 Weak Topic Analyzer**: Analyzes quiz performance to identify and rank weak concepts, generating visual heatmaps and AI-driven study strategies.
- **🎯 AI Skill Gap Predictor**: Compares user skills against industry demands to predict gaps and recommend next learning steps.
- **🗺️ Career Roadmap Generator**: Generates customized month-by-month learning roadmaps based on a user's career goals.
- **🤖 AI Mentor Chatbot**: A ChatGPT-powered personalized coach that provides motivation, concept explanations, and career advice.
- **📊 Advanced Analytics**: Comprehensive dashboards featuring dynamic charts (Recharts) for studying habits, retention curves, and skill growth.

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Framer Motion, Recharts, React Router v6
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: MongoDB Atlas, Mongoose
- **AI Integration**: OpenAI API
- **Architecture**: MVC Pattern

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB account (for connection string)
- OpenAI API Key

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory (refer to `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_min_32_chars
OPENAI_API_KEY=your_openai_api_key
CLIENT_URL=http://localhost:5173
```
Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```

## ✅ Quality gates

```bash
cd frontend && npm run lint && npm run build
cd backend && node --check server.js
```

### Bundle analysis

```bash
cd frontend && npm run analyze
```

Opens `dist/bundle-stats.html` with gzip/brotli sizes per chunk.

CI runs these checks on push/PR via `.github/workflows/ci.yml`.

## 🚢 Deployment

- **Frontend (Vercel)**: Set root directory to `frontend`. Set `VITE_API_URL` to your production API (e.g. `https://your-api.onrender.com/api`). `vercel.json` rewrites `/api` to the backend.
- **Backend (Render)**: Use `render.yaml`. Required env: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL), `NODE_ENV=production`.

### Production checklist

| Item | Action |
|------|--------|
| Auth | httpOnly cookie session; `credentials: true` on axios; `CLIENT_URL` matches frontend origin |
| CORS | Backend `CLIENT_URL` must equal deployed frontend URL exactly |
| Secrets | Never commit `.env`; rotate `JWT_SECRET` if exposed |
| Health | Monitor `GET /api/health` |
| Lighthouse | `npm run build && npm run preview` → audit landing + login (chart routes load heavier chunks on demand) |

## 📝 License
This project is licensed under the MIT License.
