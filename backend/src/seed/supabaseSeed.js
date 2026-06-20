require('dotenv').config();
const supabase = require('../config/supabase');

const foods = [
  {
    name: 'Oats with Banana',
    category: 'indian',
    type: 'vegetarian',
    meal_type: 'breakfast',
    calories: 350,
    protein: 12,
    carbs: 60,
    fats: 8,
    fiber: 6,
    serving_size: '1 bowl',
    cost: 30,
    region: 'general',
    is_budget_friendly: true,
    is_hostel_friendly: true,
    tags: ['healthy', 'breakfast', 'easy']
  },
  {
    name: 'Dal (Yellow Lentils)',
    category: 'indian',
    type: 'vegetarian',
    meal_type: 'lunch',
    calories: 150,
    protein: 9,
    carbs: 20,
    fats: 5,
    fiber: 8,
    serving_size: '1 bowl',
    cost: 25,
    region: 'general',
    is_budget_friendly: true,
    is_hostel_friendly: true,
    tags: ['protein', 'lunch', 'budget']
  },
  {
    name: 'Rice (White)',
    category: 'indian',
    type: 'vegetarian',
    meal_type: 'lunch',
    calories: 200,
    protein: 4,
    carbs: 45,
    fats: 1,
    fiber: 1,
    serving_size: '1 cup',
    cost: 15,
    region: 'general',
    is_budget_friendly: true,
    is_hostel_friendly: true,
    tags: ['carbs', 'lunch', 'staple']
  },
  {
    name: 'Roti/Chapati',
    category: 'indian',
    type: 'vegetarian',
    meal_type: 'dinner',
    calories: 100,
    protein: 3,
    carbs: 20,
    fats: 1,
    fiber: 3,
    serving_size: '1 piece',
    cost: 5,
    region: 'general',
    is_budget_friendly: true,
    is_hostel_friendly: true,
    tags: ['carbs', 'dinner', 'staple']
  },
  {
    name: 'Paneer Curry',
    category: 'north_indian',
    type: 'vegetarian',
    meal_type: 'dinner',
    calories: 250,
    protein: 18,
    carbs: 10,
    fats: 18,
    fiber: 2,
    serving_size: '1 bowl',
    cost: 60,
    region: 'north_india',
    is_budget_friendly: false,
    is_hostel_friendly: false,
    tags: ['protein', 'dinner', 'north_indian']
  },
  {
    name: 'Idli Sambar',
    category: 'south_indian',
    type: 'vegetarian',
    meal_type: 'breakfast',
    calories: 300,
    protein: 12,
    carbs: 50,
    fats: 6,
    fiber: 8,
    serving_size: '2 idli + sambar',
    cost: 40,
    region: 'tamil_nadu',
    is_budget_friendly: true,
    is_hostel_friendly: true,
    tags: ['breakfast', 'south_indian', 'healthy']
  },
  {
    name: 'Masala Dosa',
    category: 'south_indian',
    type: 'vegetarian',
    meal_type: 'breakfast',
    calories: 350,
    protein: 8,
    carbs: 55,
    fats: 12,
    fiber: 6,
    serving_size: '1 dosa',
    cost: 50,
    region: 'south_india',
    is_budget_friendly: true,
    is_hostel_friendly: true,
    tags: ['breakfast', 'south_indian', 'popular']
  },
  {
    name: 'Egg Curry',
    category: 'indian',
    type: 'non-vegetarian',
    meal_type: 'lunch',
    calories: 200,
    protein: 14,
    carbs: 8,
    fats: 14,
    fiber: 1,
    serving_size: '2 eggs',
    cost: 40,
    region: 'general',
    is_budget_friendly: true,
    is_hostel_friendly: true,
    tags: ['protein', 'lunch', 'eggs']
  },
  {
    name: 'Chicken Curry',
    category: 'north_indian',
    type: 'non-vegetarian',
    meal_type: 'dinner',
    calories: 300,
    protein: 25,
    carbs: 10,
    fats: 20,
    fiber: 2,
    serving_size: '1 bowl',
    cost: 80,
    region: 'north_india',
    is_budget_friendly: false,
    is_hostel_friendly: false,
    tags: ['protein', 'dinner', 'chicken']
  },
  {
    name: 'Sprouts Salad',
    category: 'indian',
    type: 'vegetarian',
    meal_type: 'snacks',
    calories: 100,
    protein: 6,
    carbs: 15,
    fats: 2,
    fiber: 5,
    serving_size: '1 bowl',
    cost: 20,
    region: 'general',
    is_budget_friendly: true,
    is_hostel_friendly: true,
    tags: ['healthy', 'snacks', 'protein']
  },
  {
    name: 'Mixed Vegetable Curry',
    category: 'indian',
    type: 'vegetarian',
    meal_type: 'lunch',
    calories: 120,
    protein: 4,
    carbs: 15,
    fats: 6,
    fiber: 4,
    serving_size: '1 bowl',
    cost: 30,
    region: 'general',
    is_budget_friendly: true,
    is_hostel_friendly: true,
    tags: ['vegetables', 'lunch', 'healthy']
  },
  {
    name: 'Fish Curry',
    category: 'south_indian',
    type: 'non-vegetarian',
    meal_type: 'lunch',
    calories: 250,
    protein: 28,
    carbs: 8,
    fats: 14,
    fiber: 1,
    serving_size: '1 piece',
    cost: 100,
    region: 'kerala',
    is_budget_friendly: false,
    is_hostel_friendly: false,
    tags: ['protein', 'lunch', 'fish']
  },
  {
    name: 'Upma',
    category: 'south_indian',
    type: 'vegetarian',
    meal_type: 'breakfast',
    calories: 280,
    protein: 8,
    carbs: 45,
    fats: 8,
    fiber: 4,
    serving_size: '1 bowl',
    cost: 25,
    region: 'south_india',
    is_budget_friendly: true,
    is_hostel_friendly: true,
    tags: ['breakfast', 'south_indian', 'budget']
  },
  {
    name: 'Poha',
    category: 'indian',
    type: 'vegetarian',
    meal_type: 'breakfast',
    calories: 250,
    protein: 6,
    carbs: 40,
    fats: 8,
    fiber: 3,
    serving_size: '1 bowl',
    cost: 30,
    region: 'general',
    is_budget_friendly: true,
    is_hostel_friendly: true,
    tags: ['breakfast', 'easy', 'budget']
  },
  {
    name: 'Curd Rice',
    category: 'south_indian',
    type: 'vegetarian',
    meal_type: 'lunch',
    calories: 200,
    protein: 6,
    carbs: 35,
    fats: 5,
    fiber: 2,
    serving_size: '1 bowl',
    cost: 20,
    region: 'south_india',
    is_budget_friendly: true,
    is_hostel_friendly: true,
    tags: ['lunch', 'cooling', 'budget']
  }
];

const workoutsData = [
  {
    name: 'Full Body Weight Loss',
    category: 'weight_loss',
    difficulty: 'beginner',
    duration: 30,
    calories_burned: 250,
    equipment: ['None'],
    exercises: [
      { name: 'Jumping Jacks', sets: 3, reps: 20, rest_time: '30s', description: 'Full body cardio' },
      { name: 'Squats', sets: 3, reps: 15, rest_time: '45s', description: 'Leg workout' },
      { name: 'Push-ups', sets: 3, reps: 10, rest_time: '45s', description: 'Upper body' },
      { name: 'Lunges', sets: 3, reps: 12, rest_time: '45s', description: 'Leg workout' },
      { name: 'Plank', sets: 3, reps: 30, rest_time: '30s', description: 'Core strength' }
    ]
  },
  {
    name: 'Muscle Building - Upper Body',
    category: 'muscle_gain',
    difficulty: 'intermediate',
    duration: 45,
    calories_burned: 350,
    equipment: ['Dumbbells', 'Barbell', 'Bench'],
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 10, rest_time: '60s', description: 'Chest workout' },
      { name: 'Overhead Press', sets: 4, reps: 10, rest_time: '60s', description: 'Shoulder workout' },
      { name: 'Barbell Rows', sets: 4, reps: 10, rest_time: '60s', description: 'Back workout' },
      { name: 'Bicep Curls', sets: 3, reps: 12, rest_time: '45s', description: 'Bicep workout' },
      { name: 'Tricep Dips', sets: 3, reps: 12, rest_time: '45s', description: 'Tricep workout' }
    ]
  },
  {
    name: 'Home Workout - No Equipment',
    category: 'home_workout',
    difficulty: 'beginner',
    duration: 25,
    calories_burned: 200,
    equipment: ['None'],
    exercises: [
      { name: 'Mountain Climbers', sets: 3, reps: 20, rest_time: '30s', description: 'Full body cardio' },
      { name: 'Burpees', sets: 3, reps: 10, rest_time: '45s', description: 'Full body explosive' },
      { name: 'Diamond Push-ups', sets: 3, reps: 8, rest_time: '45s', description: 'Tricep focus' },
      { name: 'Glute Bridges', sets: 3, reps: 15, rest_time: '30s', description: 'Glute workout' }
    ]
  },
  {
    name: 'Lean Bulk - Full Body',
    category: 'lean_bulk',
    difficulty: 'intermediate',
    duration: 60,
    calories_burned: 450,
    equipment: ['Dumbbells', 'Barbell', 'Pull-up Bar'],
    exercises: [
      { name: 'Deadlift', sets: 4, reps: 8, rest_time: '90s', description: 'Full body compound' },
      { name: 'Squats', sets: 4, reps: 10, rest_time: '90s', description: 'Leg workout' },
      { name: 'Pull-ups', sets: 4, reps: 8, rest_time: '60s', description: 'Back workout' },
      { name: 'Dumbbell Press', sets: 4, reps: 10, rest_time: '60s', description: 'Chest workout' },
      { name: 'Romanian Deadlift', sets: 3, reps: 12, rest_time: '60s', description: 'Hamstring workout' }
    ]
  }
];

const seedSupabase = async () => {
  try {
    console.log('Seeding Supabase Database...');

    // 1. Clear old foods and workouts (cascades to diet_meals and exercises)
    const { error: clearFoodsErr } = await supabase.from('foods').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: clearWorkoutsErr } = await supabase.from('workouts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (clearFoodsErr) console.warn('Warning clearing foods:', clearFoodsErr.message);
    if (clearWorkoutsErr) console.warn('Warning clearing workouts:', clearWorkoutsErr.message);

    // 2. Seed Foods
    const { data: seededFoods, error: foodErr } = await supabase
      .from('foods')
      .insert(foods)
      .select();

    if (foodErr) throw new Error(foodErr.message);
    console.log(`Successfully seeded ${seededFoods.length} foods.`);

    // 3. Seed Workouts & Exercises
    let exercisesToInsert = [];
    for (const wData of workoutsData) {
      const { exercises, ...wFields } = wData;
      const { data: workout, error: wErr } = await supabase
        .from('workouts')
        .insert([wFields])
        .select()
        .single();

      if (wErr) throw new Error(wErr.message);

      const exercisesRows = exercises.map(ex => ({
        workout_id: workout.id,
        name: ex.name,
        sets: parseInt(ex.sets),
        reps: parseInt(ex.reps) || 10,
        rest_time: ex.rest_time || '45s',
        description: ex.description || ''
      }));

      exercisesToInsert = [...exercisesToInsert, ...exercisesRows];
    }

    if (exercisesToInsert.length > 0) {
      const { error: exErr } = await supabase
        .from('exercises')
        .insert(exercisesToInsert);
      if (exErr) throw new Error(exErr.message);
    }

    console.log(`Successfully seeded workouts and exercises.`);
    console.log('Supabase Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Supabase database:', error.message);
    process.exit(1);
  }
};

seedSupabase();
