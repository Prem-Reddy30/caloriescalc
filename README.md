# NutriBudget AI

AI-powered nutrition, diet planning, and fitness tracking platform with budget optimization.

## Features

- **Calorie Calculator** - Calculate BMR, TDEE, and daily calorie needs
- **BMI Calculator** - Track Body Mass Index and health category
- **Water Intake Calculator** - Personalized daily water recommendations
- **Budget Diet Generator** - Create diet plans that fit your budget
- **Food Database** - Search and explore Indian foods with nutrition info
- **Workout Recommendations** - Customized workout plans
- **Progress Tracking** - Track weight, calories, and fitness progress
- **AI-Powered** - Get personalized nutrition recommendations

## Tech Stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts
- React Hook Form

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- OpenAI API

## Project Structure

```
nutribudget-ai/
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js app directory
│   │   ├── components/       # React components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── CalorieCalculator.tsx
│   │   │   ├── BMICalculator.tsx
│   │   │   ├── WaterIntakeCalculator.tsx
│   │   │   ├── BudgetDietGenerator.tsx
│   │   │   └── LandingPage.tsx
│   │   └── lib/             # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── seed/            # Seed data
│   │   └── server.js        # Main server file
│   ├── package.json
│   └── .env.example
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nutribudget-ai
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

5. Seed the database:
```bash
npm run seed
```

6. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Calculators
- `POST /api/calculator/bmr` - Calculate BMR
- `POST /api/calculator/tdee` - Calculate TDEE
- `POST /api/calculator/bmi` - Calculate BMI
- `POST /api/calculator/water` - Calculate water intake

### Food
- `GET /api/food` - Get all foods with filters
- `GET /api/food/:id` - Get single food

### Diet Plans
- `POST /api/diet/generate` - Generate diet plan
- `GET /api/diet` - Get user's diet plans
- `GET /api/diet/:id` - Get single diet plan

### Workouts
- `GET /api/workout` - Get all workouts
- `GET /api/workout/:id` - Get single workout

### Progress
- `POST /api/progress` - Log progress
- `GET /api/progress` - Get user's progress
- `GET /api/progress/stats` - Get progress statistics

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Deploy

### Backend (Render)
1. Push code to GitHub
2. Import project in Render
3. Add environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create cluster
3. Get connection string
4. Update `.env` with connection string

## Features Coming Soon

- [ ] Google OAuth Login
- [ ] Email Verification
- [ ] AI Food Recognition
- [ ] Barcode Scanner
- [ ] Regional Diet Plans
- [ ] Hostel Student Mode
- [ ] Gamification (Streaks, Badges)
- [ ] Challenges
- [ ] Admin Panel
- [ ] PDF Export
- [ ] Grocery List Generator
- [ ] Dark/Light Mode Toggle

## License

MIT

## Support

For support, email support@nutribudget.ai or create an issue in the repository.
