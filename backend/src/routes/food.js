const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/auth');

const mapSqlFoodToMongo = (f) => {
  if (!f) return null;
  return {
    _id: f.id,
    id: f.id,
    name: f.name,
    category: f.category,
    type: f.type,
    mealType: f.meal_type || f.mealType,
    nutrition: {
      calories: f.calories || f.nutrition?.calories || 0,
      protein: f.protein || f.nutrition?.protein || 0,
      carbs: f.carbs || f.nutrition?.carbs || 0,
      fats: f.fats || f.nutrition?.fats || 0,
      fiber: f.fiber || f.nutrition?.fiber || 0
    },
    servingSize: f.serving_size || f.servingSize,
    cost: f.cost ? parseFloat(f.cost) : 0,
    region: f.region,
    isBudgetFriendly: f.is_budget_friendly || f.isBudgetFriendly || false,
    isHostelFriendly: f.is_hostel_friendly || f.isHostelFriendly || false,
    image: f.image,
    tags: f.tags || []
  };
};

const fallbackFoods = [
  { id: 'f1010101-1111-2222-3333-444455556666', name: 'Oats with Banana', category: 'indian', type: 'vegetarian', meal_type: 'breakfast', calories: 350, protein: 12, carbs: 60, fats: 8, serving_size: '1 bowl', cost: 30 },
  { id: 'f2020202-1111-2222-3333-444455556666', name: 'Dal (Yellow Lentils)', category: 'indian', type: 'vegetarian', meal_type: 'lunch', calories: 150, protein: 9, carbs: 20, fats: 5, serving_size: '1 bowl', cost: 25 },
  { id: 'f3030303-1111-2222-3333-444455556666', name: 'Rice (White)', category: 'indian', type: 'vegetarian', meal_type: 'lunch', calories: 200, protein: 4, carbs: 45, fats: 1, serving_size: '1 cup', cost: 15 },
  { id: 'f4040404-1111-2222-3333-444455556666', name: 'Sprouts Salad', category: 'indian', type: 'vegetarian', meal_type: 'snacks', calories: 100, protein: 6, carbs: 15, fats: 2, serving_size: '1 bowl', cost: 20 },
  { id: 'f5050505-1111-2222-3333-444455556666', name: 'Roti/Chapati', category: 'indian', type: 'vegetarian', meal_type: 'dinner', calories: 100, protein: 3, carbs: 20, fats: 1, serving_size: '1 piece', cost: 5 },
  { id: 'f6060606-1111-2222-3333-444455556666', name: 'Paneer/Tofu Curry', category: 'north_indian', type: 'vegetarian', meal_type: 'dinner', calories: 250, protein: 18, carbs: 10, fats: 18, serving_size: '1 bowl', cost: 60 }
];

// @route   GET /api/food
// @desc    Get all foods with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, category, mealType, region, search, isBudgetFriendly, isHostelFriendly } = req.query;

    let query = supabase
      .from('foods')
      .select('*');

    if (type) query = query.eq('type', type);
    if (category) query = query.eq('category', category);
    if (mealType) query = query.eq('meal_type', mealType);
    if (region) query = query.eq('region', region);
    if (isBudgetFriendly === 'true') query = query.eq('is_budget_friendly', true);
    if (isHostelFriendly === 'true') query = query.eq('is_hostel_friendly', true);
    if (search) query = query.ilike('name', `%${search}%`);

    let { data: foods, error } = await query.order('cost', { ascending: true });
    if (error) throw new Error(error.message);

    // Fallback if empty
    if (!foods || foods.length === 0) {
      foods = fallbackFoods;
      // Filter manually
      if (type) foods = foods.filter(f => f.type === type);
      if (category) foods = foods.filter(f => f.category === category);
      if (mealType) foods = foods.filter(f => f.meal_type === mealType);
      if (isBudgetFriendly === 'true') foods = foods.filter(f => f.is_budget_friendly);
      if (isHostelFriendly === 'true') foods = foods.filter(f => f.is_hostel_friendly);
      if (search) foods = foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
    }

    const mappedFoods = foods.map(mapSqlFoodToMongo);

    res.status(200).json({
      success: true,
      count: mappedFoods.length,
      foods: mappedFoods,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/food/:id
// @desc    Get single food
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const fId = req.params.id;
    let food = null;

    if (fId.startsWith('f')) {
      food = fallbackFoods.find(f => f.id === fId) || null;
    } else {
      const { data: dbFood, error } = await supabase
        .from('foods')
        .select('*')
        .eq('id', fId)
        .single();
      if (!error) food = dbFood;
    }

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.status(200).json({
      success: true,
      food: mapSqlFoodToMongo(food),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
