const mongoose = require('mongoose');

const groceryListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
  },
  items: [{
    name: String,
    quantity: String,
    estimatedCost: Number,
    category: String,
    purchased: {
      type: Boolean,
      default: false,
    },
  }],
  totalEstimatedCost: Number,
  dietPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DietPlan',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('GroceryList', groceryListSchema);
