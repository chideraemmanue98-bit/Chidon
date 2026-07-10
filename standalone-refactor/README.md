# ChidonFreelance Fullstack Standalone Setup

This directory contains the production-ready code files for refactoring ChidonFreelance into separate **Buyer (/buyer)** and **Seller (/seller)** experiences with custom role guards, secure Paystack Escrows, real-time messaging, and MongoDB configurations.

## 1. Full Folder Tree

```text
chidon-freelance-standalone/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # User creation & JWT role generation
│   │   ├── gigController.js      # Gigs filtering and creation
│   │   └── escrowController.js   # Paystack checkout and escrow releases
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification & role validations
│   ├── models/
│   │   ├── User.js               # User collections, skills & balances
│   │   ├── Gig.js                # Gig pricing packages
│   │   ├── Order.js              # Paystack references and escrowStates
│   │   ├── Message.js            # DM conversations
│   │   └── Review.js             # 5-star ratings & comments
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── gigRoutes.js
│   │   └── escrowRoutes.js
│   ├── .env                      # Kept local - never committed
│   ├── server.js                 # Server entry point with Socket.io setup
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── shared/
    │   │   │   ├── ChatView.jsx  # Real-time WebSockets inbox
    │   │   │   └── Profile.jsx   # Portfolio viewer page
    │   │   ├── BuyerLayout.jsx   # Buyer navigation & mobile bottomnav
    │   │   └── SellerLayout.jsx  # Seller admin sidebar & mobile hamburger
    │   │   └── ProtectedRoute.jsx# Auth and allowedRole guards
    │   ├── pages/
    │   │   ├── buyer/
    │   │   │   ├── BuyerHome.jsx     # Browse gigs grid
    │   │   │   ├── BuyerSearch.jsx   # Multi-filter search
    │   │   │   └── GigDetails.jsx    # Pricing tables and packages
    │   │   └── seller/
    │   │       ├── SellerDashboard.jsx # Earnings area charts & badges
    │   │       └── CreateGig.jsx       # 4-step multi-step form composer
    │   ├── AppRoutes.jsx         # Routes register with ProtectedRoute
    │   ├── App.jsx
    │   ├── index.css             # Tailwind imports
    │   └── main.jsx
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 2. Step-by-Step Guide to Run Locally

### Step 2.1: Clone/Extract and Prepare Files
Copy all provided standalone files into their respective structures under `backend/` and `frontend/` folders.

### Step 2.2: Configure Environment Variables
Inside the `backend/` folder, create a `.env` file from the `.env.example` template:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/chidon_freelance
PORT=5000
JWT_SECRET=chidon_elite_secret_key
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
USD_TO_NGN_RATE=1500
GEMINI_API_KEY=your_gemini_api_key
```

Inside the `frontend/` folder, create a `.env` file to declare your public API endpoints and Paystack keys:
```env
VITE_API_URL=http://localhost:5000/api
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

### Step 2.3: Spin up the Backend Server
Open your terminal, navigate to the `backend/` folder, and execute:
```bash
cd backend
npm install express mongoose dotenv jsonwebtoken cors socket.io @google/genai
npm run dev
# Server should boot successfully on http://localhost:5000 with MongoDB connected!
```

### Step 2.4: Spin up the Frontend Vite Dev Server
Open a second terminal window, navigate to the `frontend/` folder, and execute:
```bash
cd frontend
npm install react react-dom react-router-dom lucide-react recharts motion
npm run dev
# Frontend will boot on http://localhost:5173 or http://localhost:3000!
```

Open your browser, navigate to your local dev URL, sign in, and switch roles between **Buyer** and **Seller** to experience the isolated marketplaces!
