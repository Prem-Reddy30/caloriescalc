# NutriBudget AI - Setup Guide

## Project Status: ✅ Core Implementation Complete

The core NutriBudget AI application has been successfully built with all essential features.

## What's Been Completed

### ✅ Frontend (Next.js + TypeScript + Tailwind CSS)
- Landing page with modern UI
- Login and Register pages
- Dashboard with calculators
- Calorie Calculator component
- BMI Calculator component
- Water Intake Calculator component
- Budget Diet Generator component
- UI components (Button, Card, Input, Label, Select)
- Responsive design with dark mode support
- All dependencies installed

### ✅ Backend (Express + MongoDB)
- Express server setup
- MongoDB connection configuration
- JWT authentication system
- API routes for:
  - Authentication (register, login, profile)
  - Calculators (BMR, TDEE, BMI, water intake)
  - Food database with search
  - Diet plan generation
  - Workout recommendations
  - Progress tracking
- MongoDB models (User, Food, DietPlan, Workout, Progress, GroceryList)
- Middleware (auth, error handling, rate limiting)
- Seed data for foods and workouts
- All dependencies installed

### ✅ Documentation
- README.md with full project documentation
- API endpoints documented
- Setup instructions provided

## Next Steps to Run the Application

### 1. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Windows: Download from https://www.mongodb.com/try/download/community
# Start MongoDB service
```

**Option B: MongoDB Atlas (Recommended for Production)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update `backend/.env` with your connection string

### 2. Configure Backend Environment

Edit `backend/.env` and update:
```
MONGODB_URI=mongodb://localhost:27017/nutribudget-ai  # or your Atlas connection string
JWT_SECRET=your_secure_random_secret_key_here
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This will populate your database with:
- 15 Indian food items with nutrition info
- 4 workout plans

### 4. Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

### 5. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

## Testing the Application

1. Open `http://localhost:3000` to see the landing page
2. Navigate to `/register` to create an account
3. Login with your credentials
4. Access `/dashboard` to use calculators and features

## Project Structure

```
nutribudget-ai/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # Pages (landing, login, register, dashboard)
│   │   ├── components/      # React components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── CalorieCalculator.tsx
│   │   │   ├── BMICalculator.tsx
│   │   │   ├── WaterIntakeCalculator.tsx
│   │   │   ├── BudgetDietGenerator.tsx
│   │   │   └── LandingPage.tsx
│   │   └── lib/            # Utility functions
│   └── package.json
├── backend/                  # Express backend
│   ├── src/
│   │   ├── config/          # Database config
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── seed/            # Seed data
│   │   └── server.js        # Main server
│   ├── .env                # Environment variables
│   └── package.json
└── README.md
```

## Features Implemented

### Calculators
- ✅ Calorie Calculator (BMR, TDEE, daily needs)
- ✅ BMI Calculator with category
- ✅ Water Intake Calculator

### Diet Planning
- ✅ Budget Diet Generator
- ✅ Food Database (15+ Indian foods)
- ✅ Meal planning with cost optimization

### Fitness
- ✅ Workout Recommendations (4 plans)
- ✅ Progress Tracking
- ✅ Weekly progress display

### Authentication
- ✅ User Registration
- ✅ User Login
- ✅ JWT Authentication
- ✅ Protected Routes

## Remaining Features (Optional Enhancements)

These can be added later:
- Grocery List Generator
- PDF Export for diet plans
- Admin Panel
- Dark/Light Mode Toggle
- Google OAuth Login
- Email Verification
- AI Food Recognition
- Barcode Scanner
- Regional Diet Plans
- Hostel Student Mode
- Gamification (Streaks, Badges)
- Challenges

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- For Atlas, whitelist your IP address

### Port Already in Use
- Change PORT in `backend/.env`
- Change frontend port in `frontend/package.json` scripts

### Dependency Issues
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

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

### Database
- Use MongoDB Atlas for production
- Update connection string in production environment

## Support

For issues or questions:
- Check the README.md for detailed documentation
- Review API endpoints in backend routes
- Check console for error messages
