const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  dietaryPreference: {
    type: String,
    enum: ['vegetarian', 'non-vegetarian', 'vegan'],
    required: true,
  },
  goal: {
    type: String,
    enum: ['loss', 'maintenance', 'lean_bulk', 'muscle_gain'],
    required: true,
  },
  meals: {
    breakfast: {
      items: [{
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Food',
        },
        quantity: String,
      }],
      calories: Number,
      protein: Number,
      carbs: Number,
      fats: Number,
      cost: Number,
    },
    lunch: {
      items: [{
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Food',
        },
        quantity: String,
      }],
      calories: Number,
      protein: Number,
      carbs: Number,
      fats: Number,
      cost: Number,
    },
    snacks: {
      items: [{
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Food',
        },
        quantity: String,
      }],
      calories: Number,
      protein: Number,
      carbs: Number,
      fats: Number,
      cost: Number,
    },
    dinner: {
      items: [{
        food: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Food',
        },
        quantity: String,
      }],
      calories: Number,
      protein: Number,
      carbs: Number,
      fats: Number,
      cost: Number,
    },
  },
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFats: Number,
  totalCost: Number,
  isAIGenerated: {
    type: Boolean,
    default: false,
  },
  aiPrompt: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);
