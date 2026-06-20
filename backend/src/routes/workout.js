const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/auth');

const mapSqlWorkoutToMongo = (workoutRow, exercises = []) => {
  if (!workoutRow) return null;
  return {
    _id: workoutRow.id,
    id: workoutRow.id,
    name: workoutRow.name,
    category: workoutRow.category,
    difficulty: workoutRow.difficulty,
    duration: workoutRow.duration,
    equipment: workoutRow.equipment || [],
    caloriesBurned: workoutRow.calories_burned || 0,
    exercises: exercises.map(e => ({
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      restTime: e.rest_time || e.restTime || '45s',
      videoUrl: e.video_url || e.videoUrl || '',
      description: e.description || ''
    })),
    createdAt: workoutRow.created_at
  };
};

const fallbackExercises = {
  'w1010101-1111-2222-3333-444455556666': [
    { name: 'Jumping Jacks', sets: 3, reps: 20, rest_time: '30s', description: 'Full body cardio' },
    { name: 'Squats', sets: 3, reps: 15, rest_time: '45s', description: 'Leg workout' },
    { name: 'Push-ups', sets: 3, reps: 10, rest_time: '45s', description: 'Upper body' },
    { name: 'Lunges', sets: 3, reps: 12, rest_time: '45s', description: 'Leg workout' },
    { name: 'Plank', sets: 3, reps: 30, rest_time: '30s', description: 'Core strength' }
  ],
  'w2020202-1111-2222-3333-444455556666': [
    { name: 'Bench Press', sets: 4, reps: 10, rest_time: '60s', description: 'Chest workout' },
    { name: 'Overhead Press', sets: 4, reps: 10, rest_time: '60s', description: 'Shoulder workout' },
    { name: 'Barbell Rows', sets: 4, reps: 10, rest_time: '60s', description: 'Back workout' },
    { name: 'Bicep Curls', sets: 3, reps: 12, rest_time: '45s', description: 'Bicep workout' },
    { name: 'Tricep Dips', sets: 3, reps: 12, rest_time: '45s', description: 'Tricep workout' }
  ],
  'w3030303-1111-2222-3333-444455556666': [
    { name: 'Mountain Climbers', sets: 3, reps: 20, rest_time: '30s', description: 'Full body cardio' },
    { name: 'Burpees', sets: 3, reps: 10, rest_time: '45s', description: 'Full body explosive' },
    { name: 'Diamond Push-ups', sets: 3, reps: 8, rest_time: '45s', description: 'Tricep focus' },
    { name: 'Glute Bridges', sets: 3, reps: 15, rest_time: '30s', description: 'Glute workout' }
  ],
  'w4040404-1111-2222-3333-444455556666': [
    { name: 'Deadlift', sets: 4, reps: 8, rest_time: '90s', description: 'Full body compound' },
    { name: 'Squats', sets: 4, reps: 10, rest_time: '90s', description: 'Leg workout' },
    { name: 'Pull-ups', sets: 4, reps: 8, rest_time: '60s', description: 'Back workout' },
    { name: 'Dumbbell Press', sets: 4, reps: 10, rest_time: '60s', description: 'Chest workout' },
    { name: 'Romanian Deadlift', sets: 3, reps: 12, rest_time: '60s', description: 'Hamstring workout' }
  ]
};

// @route   GET /api/workout
// @desc    Get all workouts with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, difficulty } = req.query;

    let query = supabase
      .from('workouts')
      .select('*');

    if (category) query = query.eq('category', category);
    if (difficulty) query = query.eq('difficulty', difficulty);

    let { data: workouts, error } = await query;
    if (error) throw new Error(error.message);

    // Fallback if Supabase workouts database table is empty
    if (!workouts || workouts.length === 0) {
      workouts = [
        { id: 'w1010101-1111-2222-3333-444455556666', name: 'Full Body Weight Loss', category: 'weight_loss', difficulty: 'beginner', duration: 30, equipment: ['None'], calories_burned: 250 },
        { id: 'w2020202-1111-2222-3333-444455556666', name: 'Muscle Building - Upper Body', category: 'muscle_gain', difficulty: 'intermediate', duration: 45, equipment: ['Dumbbells', 'Barbell', 'Bench'], calories_burned: 350 },
        { id: 'w3030303-1111-2222-3333-444455556666', name: 'Home Workout - No Equipment', category: 'home_workout', difficulty: 'beginner', duration: 25, equipment: ['None'], calories_burned: 200 },
        { id: 'w4040404-1111-2222-3333-444455556666', name: 'Lean Bulk - Full Body', category: 'lean_bulk', difficulty: 'intermediate', duration: 60, equipment: ['Dumbbells', 'Barbell', 'Pull-up Bar'], calories_burned: 450 }
      ];
      // Apply manual query filters to fallback list
      if (category) {
        workouts = workouts.filter(w => w.category === category);
      }
      if (difficulty) {
        workouts = workouts.filter(w => w.difficulty === difficulty);
      }
    }

    const mappedWorkouts = [];
    for (const w of workouts) {
      let exercises = [];
      if (w.id && !w.id.startsWith('w')) {
        const { data: exList } = await supabase
          .from('exercises')
          .select('*')
          .eq('workout_id', w.id);
        exercises = exList || [];
      } else {
        exercises = fallbackExercises[w.id] || [];
      }
      mappedWorkouts.push(mapSqlWorkoutToMongo(w, exercises));
    }

    res.status(200).json({
      success: true,
      count: mappedWorkouts.length,
      workouts: mappedWorkouts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/workout/:id
// @desc    Get single workout
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const wId = req.params.id;
    let workout = null;
    let exercises = [];

    if (wId.startsWith('w')) {
      // Fetch fallback workout
      const fallbackWorkoutsList = [
        { id: 'w1010101-1111-2222-3333-444455556666', name: 'Full Body Weight Loss', category: 'weight_loss', difficulty: 'beginner', duration: 30, equipment: ['None'], calories_burned: 250 },
        { id: 'w2020202-1111-2222-3333-444455556666', name: 'Muscle Building - Upper Body', category: 'muscle_gain', difficulty: 'intermediate', duration: 45, equipment: ['Dumbbells', 'Barbell', 'Bench'], calories_burned: 350 },
        { id: 'w3030303-1111-2222-3333-444455556666', name: 'Home Workout - No Equipment', category: 'home_workout', difficulty: 'beginner', duration: 25, equipment: ['None'], calories_burned: 200 },
        { id: 'w4040404-1111-2222-3333-444455556666', name: 'Lean Bulk - Full Body', category: 'lean_bulk', difficulty: 'intermediate', duration: 60, equipment: ['Dumbbells', 'Barbell', 'Pull-up Bar'], calories_burned: 450 }
      ];
      workout = fallbackWorkoutsList.find(w => w.id === wId) || null;
      exercises = fallbackExercises[wId] || [];
    } else {
      const { data: dbWorkout, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', wId)
        .single();

      if (error || !dbWorkout) {
        return res.status(404).json({ message: 'Workout not found' });
      }
      workout = dbWorkout;

      const { data: exList } = await supabase
        .from('exercises')
        .select('*')
        .eq('workout_id', wId);
      exercises = exList || [];
    }

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.status(200).json({
      success: true,
      workout: mapSqlWorkoutToMongo(workout, exercises),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
