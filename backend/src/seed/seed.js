require('dotenv').config();
const mongoose = require('mongoose');
const Food = require('../models/Food');
const Workout = require('../models/Workout');

const foods = [
  // Indian Vegetarian
  {
    name: 'Oats with Banana',
    category: 'indian',
    type: 'vegetarian',
    mealType: 'breakfast',
    nutrition: { calories: 350, protein: 12, carbs: 60, fats: 8, fiber: 6 },
    servingSize: '1 bowl',
    cost: 30,
    region: 'general',
    isBudgetFriendly: true,
    isHostelFriendly: true,
    tags: ['healthy', 'breakfast', 'easy'],
  },
  {
    name: 'Dal (Yellow Lentils)',
    category: 'indian',
    type: 'vegetarian',
    mealType: 'lunch',
    nutrition: { calories: 150, protein: 9, carbs: 20, fats: 5, fiber: 8 },
    servingSize: '1 bowl',
    cost: 25,
    region: 'general',
    isBudgetFriendly: true,
    isHostelFriendly: true,
    tags: ['protein', 'lunch', 'budget'],
  },
  {
    name: 'Rice (White)',
    category: 'indian',
    type: 'vegetarian',
    mealType: 'lunch',
    nutrition: { calories: 200, protein: 4, carbs: 45, fats: 1, fiber: 1 },
    servingSize: '1 cup',
    cost: 15,
    region: 'general',
    isBudgetFriendly: true,
    isHostelFriendly: true,
    tags: ['carbs', 'lunch', 'staple'],
  },
  {
    name: 'Roti/Chapati',
    category: 'indian',
    type: 'vegetarian',
    mealType: 'dinner',
    nutrition: { calories: 100, protein: 3, carbs: 20, fats: 1, fiber: 3 },
    servingSize: '1 piece',
    cost: 5,
    region: 'general',
    isBudgetFriendly: true,
    isHostelFriendly: true,
    tags: ['carbs', 'dinner', 'staple'],
  },
  {
    name: 'Paneer Curry',
    category: 'north_indian',
    type: 'vegetarian',
    mealType: 'dinner',
    nutrition: { calories: 250, protein: 18, carbs: 10, fats: 18, fiber: 2 },
    servingSize: '1 bowl',
    cost: 60,
    region: 'north_india',
    isBudgetFriendly: false,
    isHostelFriendly: false,
    tags: ['protein', 'dinner', 'north_indian'],
  },
  {
    name: 'Idli Sambar',
    category: 'south_indian',
    type: 'vegetarian',
    mealType: 'breakfast',
    nutrition: { calories: 300, protein: 12, carbs: 50, fats: 6, fiber: 8 },
    servingSize: '2 idli + sambar',
    cost: 40,
    region: 'tamil_nadu',
    isBudgetFriendly: true,
    isHostelFriendly: true,
    tags: ['breakfast', 'south_indian', 'healthy'],
  },
  {
    name: 'Masala Dosa',
    category: 'south_indian',
    type: 'vegetarian',
    mealType: 'breakfast',
    nutrition: { calories: 350, protein: 8, carbs: 55, fats: 12, fiber: 6 },
    servingSize: '1 dosa',
    cost: 50,
    region: 'south_india',
    isBudgetFriendly: true,
    isHostelFriendly: true,
    tags: ['breakfast', 'south_indian', 'popular'],
  },
  {
    name: 'Egg Curry',
    category: 'indian',
    type: 'non-vegetarian',
    mealType: 'lunch',
    nutrition: { calories: 200, protein: 14, carbs: 8, fats: 14, fiber: 1 },
    servingSize: '2 eggs',
    cost: 40,
    region: 'general',
    isBudgetFriendly: true,
    isHostelFriendly: true,
    tags: ['protein', 'lunch', 'eggs'],
  },
  {
    name: 'Chicken Curry',
    category: 'north_indian',
    type: 'non-vegetarian',
    mealType: 'dinner',
    nutrition: { calories: 300, protein: 25, carbs: 10, fats: 20, fiber: 2 },
    servingSize: '1 bowl',
    cost: 80,
    region: 'north_india',
    isBudgetFriendly: false,
    isHostelFriendly: false,
    tags: ['protein', 'dinner', 'chicken'],
  },
  {
    name: 'Sprouts Salad',
    category: 'indian',
    type: 'vegetarian',
    mealType: 'snacks',
    nutrition: { calories: 100, protein: 6, carbs: 15, fats: 2, fiber: 5 },
    servingSize: '1 bowl',
    cost: 20,
    region: 'general',
    isBudgetFriendly: true,
    isHostelFriendly: true,
    tags: ['healthy', 'snacks', 'protein'],
  },
  {
    name: 'Mixed Vegetable Curry',
    category: 'indian',
    type: 'vegetarian',
    mealType: 'lunch',
    nutrition: { calories: 120, protein: 4, carbs: 15, fats: 6, fiber: 4 },
    servingSize: '1 bowl',
    cost: 30,
    region: 'general',
    isBudgetFriendly: true,
    isHostelFriendly: true,
    tags: ['vegetables', 'lunch', 'healthy'],
  },
  {
    name: 'Fish Curry',
    category: 'south_indian',
    type: 'non-vegetarian',
    mealType: 'lunch',
    nutrition: { calories: 250, protein: 28, carbs: 8, fats: 14, fiber: 1 },
    servingSize: '1 piece',
    cost: 100,
    region: 'kerala',
    isBudgetFriendly: false,
    isHostelFriendly: false,
    tags: ['protein', 'lunch', 'fish'],
  },
  {
    name: 'Upma',
    category: 'south_indian',
    type: 'vegetarian',
    mealType: 'breakfast',
    nutrition: { calories: 280, protein: 8, carbs: 45, fats: 8, fiber: 4 },
    servingSize: '1 bowl',
    cost: 25,
    region: 'south_india',
    isBudgetFriendly: true,
    isHostelFriendly: true,
    tags: ['breakfast', 'south_indian', 'budget'],
  },
  {
    name: 'Poha',
    category: 'indian',
    type: 'vegetarian',
    mealType: 'breakfast',
    nutrition: { calories: 250, protein: 6, carbs: 40, fats: 8, fiber: 3 },
    servingSize: '1 bowl',
    cost: 30,
    region: 'general',
    isBudgetFriendly: true,
    isHostelFriendly: true,
    tags: ['breakfast', 'easy', 'budget'],
  },
  {
    name: 'Curd Rice',
    category: 'south_indian',
    type: 'vegetarian',
    mealType: 'lunch',
    nutrition: { calories: 200, protein: 6, carbs: 35, fats: 5, fiber: 2 },
    servingSize: '1 bowl',
    cost: 20,
    region: 'south_india',
    isBudgetFriendly: true,
    isHostelFriendly: true,
    tags: ['lunch', 'cooling', 'budget'],
  },
];

const workouts = [
  {
    name: 'Full Body Weight Loss',
    category: 'weight_loss',
    difficulty: 'beginner',
    duration: 30,
    exercises: [
      { name: 'Jumping Jacks', sets: 3, reps: 20, restTime: '30s', videoUrl: '', description: 'Full body cardio' },
      { name: 'Squats', sets: 3, reps: 15, restTime: '45s', videoUrl: '', description: 'Leg workout' },
      { name: 'Push-ups', sets: 3, reps: 10, restTime: '45s', videoUrl: '', description: 'Upper body' },
      { name: 'Lunges', sets: 3, reps: 12, restTime: '45s', videoUrl: '', description: 'Leg workout' },
      { name: 'Plank', sets: 3, reps: '30s', restTime: '30s', videoUrl: '', description: 'Core strength' },
    ],
    equipment: ['None'],
    caloriesBurned: 250,
  },
  {
    name: 'Muscle Building - Upper Body',
    category: 'muscle_gain',
    difficulty: 'intermediate',
    duration: 45,
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 10, restTime: '60s', videoUrl: '', description: 'Chest workout' },
      { name: 'Overhead Press', sets: 4, reps: 10, restTime: '60s', videoUrl: '', description: 'Shoulder workout' },
      { name: 'Barbell Rows', sets: 4, reps: 10, restTime: '60s', videoUrl: '', description: 'Back workout' },
      { name: 'Bicep Curls', sets: 3, reps: 12, restTime: '45s', videoUrl: '', description: 'Bicep workout' },
      { name: 'Tricep Dips', sets: 3, reps: 12, restTime: '45s', videoUrl: '', description: 'Tricep workout' },
    ],
    equipment: ['Dumbbells', 'Barbell', 'Bench'],
    caloriesBurned: 350,
  },
  {
    name: 'Home Workout - No Equipment',
    category: 'home_workout',
    difficulty: 'beginner',
    duration: 25,
    exercises: [
      { name: 'Mountain Climbers', sets: 3, reps: 20, restTime: '30s', videoUrl: '', description: 'Full body cardio' },
      { name: 'Burpees', sets: 3, reps: 10, restTime: '45s', videoUrl: '', description: 'Full body explosive' },
      { name: 'Diamond Push-ups', sets: 3, reps: 8, restTime: '45s', videoUrl: '', description: 'Tricep focus' },
      { name: 'Glute Bridges', sets: 3, reps: 15, restTime: '30s', videoUrl: '', description: 'Glute workout' },
    ],
    equipment: ['None'],
    caloriesBurned: 200,
  },
  {
    name: 'Lean Bulk - Full Body',
    category: 'lean_bulk',
    difficulty: 'intermediate',
    duration: 60,
    exercises: [
      { name: 'Deadlift', sets: 4, reps: 8, restTime: '90s', videoUrl: '', description: 'Full body compound' },
      { name: 'Squats', sets: 4, reps: 10, restTime: '90s', videoUrl: '', description: 'Leg workout' },
      { name: 'Pull-ups', sets: 4, reps: 8, restTime: '60s', videoUrl: '', description: 'Back workout' },
      { name: 'Dumbbell Press', sets: 4, reps: 10, restTime: '60s', videoUrl: '', description: 'Chest workout' },
      { name: 'Romanian Deadlift', sets: 3, reps: 12, restTime: '60s', videoUrl: '', description: 'Hamstring workout' },
    ],
    equipment: ['Dumbbells', 'Barbell', 'Pull-up Bar'],
    caloriesBurned: 450,
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing data
    await Food.deleteMany();
    await Workout.deleteMany();
    console.log('Cleared existing data');

    // Insert foods
    await Food.insertMany(foods);
    console.log('Inserted foods');

    // Insert workouts
    await Workout.insertMany(workouts);
    console.log('Inserted workouts');

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
