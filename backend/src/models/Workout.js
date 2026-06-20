const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'lean_bulk', 'home_workout', 'gym_workout'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  exercises: [{
    name: String,
    sets: Number,
    reps: Number,
    restTime: String,
    videoUrl: String,
    description: String,
  }],
  equipment: [String],
  caloriesBurned: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Workout', workoutSchema);
