const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

const mapSqlProgressToMongo = (progressRow, loggedFoods = []) => {
  if (!progressRow) return null;
  return {
    _id: progressRow.id,
    id: progressRow.id,
    user: progressRow.user_id,
    date: progressRow.date,
    weight: progressRow.weight ? parseFloat(progressRow.weight) : null,
    bmi: progressRow.bmi ? parseFloat(progressRow.bmi) : null,
    caloriesConsumed: progressRow.calories_consumed || 0,
    caloriesBurned: progressRow.calories_burned || 0,
    waterIntake: progressRow.water_intake || 0,
    workoutCompleted: progressRow.workout_completed || false,
    workoutId: progressRow.workout_id || null,
    notes: progressRow.notes || '',
    foodEntries: loggedFoods.map(f => ({
      name: f.name,
      cal: f.calories,
      protein: f.protein ? parseFloat(f.protein) : 0,
      carbs: f.carbs ? parseFloat(f.carbs) : 0,
      fat: f.fat ? parseFloat(f.fat) : 0,
      emoji: f.emoji || '🍽️'
    })),
    summaryEmailSent: progressRow.summary_email_sent || false,
    createdAt: progressRow.created_at
  };
};

// @route   POST /api/progress
// @desc    Log progress (Compatibility route)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { date, weight, caloriesConsumed, waterIntake, workoutCompleted, notes } = req.body;
    const logDateObj = new Date(date || Date.now());
    const year = logDateObj.getFullYear();
    const month = String(logDateObj.getMonth() + 1).padStart(2, '0');
    const day = String(logDateObj.getDate()).padStart(2, '0');
    const logDateStr = `${year}-${month}-${day}`;

    const { data: progress, error } = await supabase
      .from('daily_progress')
      .insert([{
        user_id: req.user.id,
        date: logDateStr,
        weight: weight ? parseFloat(weight) : null,
        calories_consumed: caloriesConsumed ? parseInt(caloriesConsumed) : 0,
        water_intake: waterIntake ? parseInt(waterIntake) : 0,
        workout_completed: !!workoutCompleted,
        notes: notes || ''
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);

    res.status(201).json({
      success: true,
      progress: mapSqlProgressToMongo(progress, []),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/progress
// @desc    Get user's progress
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', req.user.id);

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data: logs, error } = await query.order('date', { ascending: false });
    if (error) throw new Error(error.message);

    const progressList = [];
    for (const log of logs) {
      const { data: foods } = await supabase
        .from('logged_foods')
        .select('*')
        .eq('progress_id', log.id);
      
      progressList.push(mapSqlProgressToMongo(log, foods || []));
    }

    res.status(200).json({
      success: true,
      progress: progressList,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/progress/stats
// @desc    Get progress statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const { data: logs, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', req.user.id)
      .order('date', { ascending: true });

    if (error) throw new Error(error.message);

    const stats = {
      totalEntries: logs.length,
      weightChange: 0,
      averageCalories: 0,
      averageWater: 0,
      workoutsCompleted: 0,
    };

    if (logs.length > 1) {
      const firstWeight = logs.find(l => l.weight)?.weight;
      let lastWeight;
      for (let i = logs.length - 1; i >= 0; i--) {
        if (logs[i].weight) {
          lastWeight = logs[i].weight;
          break;
        }
      }
      if (firstWeight && lastWeight) {
        stats.weightChange = parseFloat((lastWeight - firstWeight).toFixed(2));
      }
    }

    if (logs.length > 0) {
      stats.averageCalories = Math.round(logs.reduce((sum, p) => sum + (p.calories_consumed || 0), 0) / logs.length);
      stats.averageWater = Math.round(logs.reduce((sum, p) => sum + (p.water_intake || 0), 0) / logs.length);
      stats.workoutsCompleted = logs.filter(p => p.workout_completed).length;
    }

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/progress/sync
// @desc    Sync local progress logs with database
// @access  Private
router.post('/sync', protect, async (req, res) => {
  try {
    const { date, weight, caloriesConsumed, waterIntake, foodEntries, workoutCompleted } = req.body;
    
    const logDateObj = new Date(date || Date.now());
    const year = logDateObj.getFullYear();
    const month = String(logDateObj.getMonth() + 1).padStart(2, '0');
    const day = String(logDateObj.getDate()).padStart(2, '0');
    const logDateStr = `${year}-${month}-${day}`;

    // Find progress for this user on this exact day
    let { data: progress, error: findError } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('date', logDateStr)
      .maybeSingle();

    const updateData = {
      weight: weight !== undefined ? parseFloat(weight) : undefined,
      calories_consumed: caloriesConsumed !== undefined ? parseInt(caloriesConsumed) : undefined,
      water_intake: waterIntake !== undefined ? parseInt(waterIntake) : undefined,
      workout_completed: workoutCompleted !== undefined ? !!workoutCompleted : undefined,
    };

    // Filter out undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    if (progress) {
      // Update existing
      const { data: updatedProgress, error: updateError } = await supabase
        .from('daily_progress')
        .update(updateData)
        .eq('id', progress.id)
        .select()
        .single();

      if (updateError) throw new Error(updateError.message);
      progress = updatedProgress;
    } else {
      // Create new progress record
      const { data: newProgress, error: createError } = await supabase
        .from('daily_progress')
        .insert([{
          user_id: req.user.id,
          date: logDateStr,
          weight: weight ? parseFloat(weight) : null,
          calories_consumed: caloriesConsumed ? parseInt(caloriesConsumed) : 0,
          water_intake: waterIntake ? parseInt(waterIntake) : 0,
          workout_completed: !!workoutCompleted
        }])
        .select()
        .single();

      if (createError) throw new Error(createError.message);
      progress = newProgress;
    }

    // Handle foodEntries updates
    if (foodEntries !== undefined) {
      // Delete old food entries for this daily progress row
      const { error: deleteError } = await supabase
        .from('logged_foods')
        .delete()
        .eq('progress_id', progress.id);

      if (deleteError) throw new Error(deleteError.message);

      // Insert new food entries
      if (foodEntries.length > 0) {
        const insertRows = foodEntries.map(f => ({
          progress_id: progress.id,
          name: f.name,
          calories: f.cal,
          protein: f.protein || 0,
          carbs: f.carbs || 0,
          fat: f.fat || 0,
          emoji: f.emoji || '🍽️'
        }));

        const { error: insertError } = await supabase
          .from('logged_foods')
          .insert(insertRows);

        if (insertError) throw new Error(insertError.message);
      }
    }

    // Fetch final foods list to return the unified progress object
    const { data: currentFoods } = await supabase
      .from('logged_foods')
      .select('*')
      .eq('progress_id', progress.id);

    const mongoProgress = mapSqlProgressToMongo(progress, currentFoods || []);

    // Log the sync activity
    const logDetails = {};
    if (foodEntries && foodEntries.length > 0) logDetails.foodCount = foodEntries.length;
    if (waterIntake !== undefined && waterIntake > 0) logDetails.waterIntake = waterIntake;
    if (workoutCompleted) logDetails.workoutCompleted = true;
    if (weight) logDetails.weight = weight;

    await logActivity(req.user.id, 'progress_synced', logDetails);

    res.status(200).json({
      success: true,
      progress: mongoProgress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
