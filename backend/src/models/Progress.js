const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  weight: Number,
  bmi: Number,
  caloriesConsumed: Number,
  caloriesBurned: Number,
  waterIntake: Number,
  workoutCompleted: {
    type: Boolean,
    default: false,
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
  },
  notes: String,
  foodEntries: [
    {
      name: String,
      cal: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      emoji: String
    }
  ],
  summaryEmailSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
progressSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Progress', progressSchema);
