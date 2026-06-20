const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a food name'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['indian', 'south_indian', 'north_indian', 'continental', 'chinese', 'hostel_friendly'],
    required: true,
  },
  type: {
    type: String,
    enum: ['vegetarian', 'non-vegetarian', 'vegan'],
    required: true,
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
    required: true,
  },
  nutrition: {
    calories: {
      type: Number,
      required: true,
    },
    protein: {
      type: Number,
      required: true,
    },
    carbs: {
      type: Number,
      required: true,
    },
    fats: {
      type: Number,
      required: true,
    },
    fiber: {
      type: Number,
      default: 0,
    },
  },
  servingSize: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  region: {
    type: String,
    enum: ['andhra', 'telangana', 'tamil_nadu', 'kerala', 'karnataka', 'maharashtra', 'north_india', 'general'],
    default: 'general',
  },
  isBudgetFriendly: {
    type: Boolean,
    default: false,
  },
  isHostelFriendly: {
    type: Boolean,
    default: false,
  },
  image: String,
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for search
foodSchema.index({ name: 'text', tags: 'text' });

module.exports = mongoose.model('Food', foodSchema);
