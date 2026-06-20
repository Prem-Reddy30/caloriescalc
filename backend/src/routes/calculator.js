const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   POST /api/calculator/bmr
// @desc    Calculate BMR
// @access  Private
router.post('/bmr', protect, (req, res) => {
  try {
    const { gender, weight, height, age } = req.body;

    let bmr;
    if (gender === 'male') {
      bmr = Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
    } else {
      bmr = Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
    }

    res.status(200).json({
      success: true,
      bmr,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/calculator/tdee
// @desc    Calculate TDEE
// @access  Private
router.post('/tdee', protect, (req, res) => {
  try {
    const { bmr, activityLevel } = req.body;

    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = Math.round(bmr * (multipliers[activityLevel] || 1.2));

    res.status(200).json({
      success: true,
      tdee,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/calculator/bmi
// @desc    Calculate BMI
// @access  Private
router.post('/bmi', protect, (req, res) => {
  try {
    const { weight, height } = req.body;
    const heightInMeters = height / 100;
    const bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));

    let category;
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    res.status(200).json({
      success: true,
      bmi,
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/calculator/water
// @desc    Calculate water intake
// @access  Private
router.post('/water', protect, (req, res) => {
  try {
    const { weight, activityLevel } = req.body;
    const baseIntake = weight * 0.033;

    const activityMultiplier = {
      sedentary: 1,
      light: 1.1,
      moderate: 1.2,
      active: 1.3,
      very_active: 1.4
    };

    const waterIntake = Math.round((baseIntake * (activityMultiplier[activityLevel] || 1)) * 10) / 10;

    res.status(200).json({
      success: true,
      waterIntake,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
