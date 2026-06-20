const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

const mapSqlDietToMongo = async (dietRow) => {
  if (!dietRow) return null;
  
  // Fetch meals items
  const { data: mealItems } = await supabase
    .from('diet_meals')
    .select('*, food:foods(*)')
    .eq('diet_plan_id', dietRow.id);

  const meals = {
    breakfast: { items: [], calories: 0, protein: 0, carbs: 0, fats: 0, cost: 0 },
    lunch: { items: [], calories: 0, protein: 0, carbs: 0, fats: 0, cost: 0 },
    snacks: { items: [], calories: 0, protein: 0, carbs: 0, fats: 0, cost: 0 },
    dinner: { items: [], calories: 0, protein: 0, carbs: 0, fats: 0, cost: 0 }
  };

  if (mealItems) {
    mealItems.forEach(item => {
      const type = item.meal_type;
      const f = item.food;
      if (f && meals[type]) {
        meals[type].items.push({
          food: {
            _id: f.id,
            id: f.id,
            name: f.name,
            category: f.category,
            type: f.type,
            mealType: f.meal_type,
            nutrition: {
              calories: f.calories,
              protein: f.protein ? parseFloat(f.protein) : 0,
              carbs: f.carbs ? parseFloat(f.carbs) : 0,
              fats: f.fats ? parseFloat(f.fats) : 0,
              fiber: f.fiber ? parseFloat(f.fiber) : 0
            },
            servingSize: f.serving_size,
            cost: f.cost ? parseFloat(f.cost) : 0,
            region: f.region,
            image: f.image
          },
          quantity: item.quantity
        });

        // Aggregate nutritional values
        meals[type].calories += f.calories || 0;
        meals[type].protein += f.protein ? parseFloat(f.protein) : 0;
        meals[type].carbs += f.carbs ? parseFloat(f.carbs) : 0;
        meals[type].fats += f.fats ? parseFloat(f.fats) : 0;
        meals[type].cost += f.cost ? parseFloat(f.cost) : 0;
      }
    });
  }

  return {
    _id: dietRow.id,
    id: dietRow.id,
    user: dietRow.user_id,
    name: dietRow.name,
    budget: parseFloat(dietRow.budget),
    dietaryPreference: dietRow.dietary_preference,
    goal: dietRow.goal,
    meals,
    totalCalories: dietRow.total_calories || 0,
    totalProtein: dietRow.total_protein || 0,
    totalCarbs: dietRow.total_carbs || 0,
    totalFats: dietRow.total_fats || 0,
    totalCost: dietRow.total_cost || 0,
    isAIGenerated: dietRow.is_ai_generated || false,
    aiPrompt: dietRow.ai_prompt || '',
    createdAt: dietRow.created_at
  };
};

// @route   POST /api/diet/generate
// @desc    Generate diet plan based on budget
// @access  Private
router.post('/generate', protect, async (req, res) => {
  try {
    const { budget, dietaryPreference, goal, numberOfMeals } = req.body;

    // Get foods from Supabase foods table
    let { data: foods, error: fetchError } = await supabase
      .from('foods')
      .select('*')
      .eq('type', dietaryPreference);

    if (fetchError) throw new Error(fetchError.message);

    // In case Supabase foods table has not been seeded yet, fallback to local memory arrays
    if (!foods || foods.length === 0) {
      // Basic fallback foods list
      foods = [
        { id: 'f1010101-1111-2222-3333-444455556666', name: 'Oats with Banana', category: 'indian', type: dietaryPreference, meal_type: 'breakfast', calories: 350, protein: 12, carbs: 60, fats: 8, serving_size: '1 bowl', cost: 30 },
        { id: 'f2020202-1111-2222-3333-444455556666', name: 'Dal (Yellow Lentils)', category: 'indian', type: dietaryPreference, meal_type: 'lunch', calories: 150, protein: 9, carbs: 20, fats: 5, serving_size: '1 bowl', cost: 25 },
        { id: 'f3030303-1111-2222-3333-444455556666', name: 'Rice (White)', category: 'indian', type: dietaryPreference, meal_type: 'lunch', calories: 200, protein: 4, carbs: 45, fats: 1, serving_size: '1 cup', cost: 15 },
        { id: 'f4040404-1111-2222-3333-444455556666', name: 'Sprouts Salad', category: 'indian', type: dietaryPreference, meal_type: 'snacks', calories: 100, protein: 6, carbs: 15, fats: 2, serving_size: '1 bowl', cost: 20 },
        { id: 'f5050505-1111-2222-3333-444455556666', name: 'Roti/Chapati', category: 'indian', type: dietaryPreference, meal_type: 'dinner', calories: 100, protein: 3, carbs: 20, fats: 1, serving_size: '1 piece', cost: 5 },
        { id: 'f6060606-1111-2222-3333-444455556666', name: 'Paneer/Tofu Curry', category: 'north_indian', type: dietaryPreference, meal_type: 'dinner', calories: 250, protein: 18, carbs: 10, fats: 18, serving_size: '1 bowl', cost: 60 }
      ];
    }

    const mealDistribution = {
      breakfast: 0.25,
      lunch: 0.35,
      snacks: 0.15,
      dinner: 0.25,
    };

    const selectedMeals = {
      breakfast: [],
      lunch: [],
      snacks: [],
      dinner: []
    };

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalCost = 0;

    // Allocate foods to meals
    for (const mealType in mealDistribution) {
      const mealFoods = foods.filter(f => f.meal_type === mealType || f.mealType === mealType).slice(0, 2);
      
      mealFoods.forEach(food => {
        selectedMeals[mealType].push({
          food_id: food.id,
          quantity: '1 serving'
        });
        totalCalories += food.calories || food.nutrition?.calories || 0;
        totalProtein += parseFloat(food.protein || food.nutrition?.protein || 0);
        totalCarbs += parseFloat(food.carbs || food.nutrition?.carbs || 0);
        totalFats += parseFloat(food.fats || food.nutrition?.fats || 0);
        totalCost += parseFloat(food.cost || 0);
      });
    }

    // Insert generated plan into diet_plans table
    const { data: createdPlan, error: insertPlanError } = await supabase
      .from('diet_plans')
      .insert([{
        user_id: req.user.id,
        name: `${goal} Diet Plan`,
        budget: parseFloat(budget),
        dietary_preference: dietaryPreference,
        goal,
        total_calories: totalCalories,
        total_protein: totalProtein,
        total_carbs: totalCarbs,
        total_fats: totalFats,
        total_cost: totalCost,
        is_ai_generated: false
      }])
      .select()
      .single();

    if (insertPlanError) throw new Error(insertPlanError.message);

    // Insert meals food items
    const mealItemsToInsert = [];
    for (const mealType in selectedMeals) {
      selectedMeals[mealType].forEach(item => {
        mealItemsToInsert.push({
          diet_plan_id: createdPlan.id,
          meal_type: mealType,
          food_id: item.food_id,
          quantity: item.quantity
        });
      });
    }

    if (mealItemsToInsert.length > 0) {
      const { error: insertMealsError } = await supabase
        .from('diet_meals')
        .insert(mealItemsToInsert);

      if (insertMealsError) throw new Error(insertMealsError.message);
    }

    // Fetch and compile fully nested mongo format response
    const compiledPlan = await mapSqlDietToMongo(createdPlan);

    // Log action
    await logActivity(req.user.id, 'diet_plan_generated', {
      budget: parseFloat(budget),
      calories: totalCalories,
      preference: dietaryPreference
    });

    res.status(201).json({
      success: true,
      dietPlan: compiledPlan
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/diet
// @desc    Get user's diet plans
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { data: dietPlans, error } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const mappedPlans = [];
    for (const plan of dietPlans) {
      const mapped = await mapSqlDietToMongo(plan);
      mappedPlans.push(mapped);
    }

    res.status(200).json({
      success: true,
      dietPlans: mappedPlans,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/diet/:id
// @desc    Get single diet plan
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { data: dietPlan, error } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    const mappedPlan = await mapSqlDietToMongo(dietPlan);

    res.status(200).json({
      success: true,
      dietPlan: mappedPlan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
