const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailSender');
const { generateSummaryHtml, generateOfferHtml } = require('../utils/emailTemplate');
const { sendDailySummaries, sendDailyDietOffers } = require('../utils/scheduler');
const { 
  calculateBMR, 
  calculateTDEE, 
  calculateCalorieGoal, 
  calculateWaterIntake 
} = require('../utils/healthCalculators');

// @route   POST /api/email/send-summary
// @desc    Send manual daily summary email
// @access  Private
router.post('/send-summary', protect, async (req, res) => {
  try {
    const { to, date, weight, calories, water, foods, workoutCompleted } = req.body;
    
    // Get user details
    const user = req.user;
    const name = user.name;
    const recipient = to || user.email;

    // Use user profile to recalculate
    const age = user.profile?.age || 25;
    const userWeight = weight || user.profile?.weight || 70;
    const height = user.profile?.height || 175;
    const gender = user.profile?.gender || 'male';
    const activityLevel = user.profile?.activityLevel || 'moderate';
    const goalType = user.profile?.goal || 'maintenance';

    const bmr = calculateBMR(gender, +userWeight, +height, +age);
    const tdee = calculateTDEE(bmr, activityLevel);
    const targetCalories = calories?.target || calculateCalorieGoal(tdee, goalType);
    const waterGoal = water?.target || Math.round(calculateWaterIntake(+userWeight, activityLevel) * 1000);

    const html = generateSummaryHtml({
      name,
      date: date || new Date().toDateString(),
      weight: userWeight,
      caloriesConsumed: calories?.consumed || 0,
      targetCalories,
      waterIntake: water?.consumed || 0,
      waterGoal,
      foods: foods || [],
      workoutCompleted: workoutCompleted || false
    });

    const result = await sendEmail({
      to: recipient,
      subject: `NutriBudget AI – Your Daily Summary (${new Date(date || Date.now()).toLocaleDateString()})`,
      html
    });

    res.status(200).json({
      success: true,
      message: 'Manual daily summary email dispatched successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/email/trigger-cron-now
// @desc    Trigger daily email summary cron job immediately for testing
// @access  Public
router.post('/trigger-cron-now', async (req, res) => {
  try {
    await sendDailySummaries();
    res.status(200).json({
      success: true,
      message: 'Scheduled daily summary email job triggered and completed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/email/send-offer
// @desc    Send manual premium diet offer email to current user
// @access  Private
router.post('/send-offer', protect, async (req, res) => {
  try {
    const user = req.user;
    const recipient = req.body.to || user.email;

    const html = generateOfferHtml({ name: user.name });

    const result = await sendEmail({
      to: recipient,
      subject: '🔥 Special Offer: Get Your Customized Diet Plan for just ₹99!',
      html
    });

    res.status(200).json({
      success: true,
      message: 'Diet plan offer email dispatched successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/email/trigger-offers-cron-now
// @desc    Trigger daily premium diet offer cron job immediately for testing
// @access  Public
router.post('/trigger-offers-cron-now', async (req, res) => {
  try {
    await sendDailyDietOffers();
    res.status(200).json({
      success: true,
      message: 'Scheduled premium diet offer email job triggered and completed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
